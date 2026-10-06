import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.purchase.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
    if (!purchase) throw new NotFoundException('Achat introuvable');
    return purchase;
  }

  async create(data: any) {
    const year = new Date().getFullYear();
    const count = await this.prisma.purchase.count();
    const reference = `ACH-${year}-${String(count + 1).padStart(5, '0')}`;
    const subtotal = data.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
    const finalTotal = subtotal - (data.discount || 0) + (data.fees || 0);

    return this.prisma.purchase.create({
      data: {
        reference,
        supplierId: data.supplierId,
        date: new Date(data.date || new Date()),
        total: subtotal,
        discount: data.discount || 0,
        fees: data.fees || 0,
        finalTotal,
        status: data.status || 'DRAFT',
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { supplier: true, items: true },
    });
  }

  async receive(id: string, userId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const purchase = await tx.purchase.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!purchase) throw new NotFoundException('Achat introuvable');
      if (purchase.status === 'RECEIVED') throw new BadRequestException('Déjà reçu');

      // Increase stock for each item
      for (const item of purchase.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        await tx.product.update({
          where: { id: product.id },
          data: { stockActuel: product.stockActuel + item.quantity },
        });

        await tx.stockMovement.create({
          data: {
            reference: `MVT-${Date.now()}-${product.id}`,
            productId: product.id,
            type: 'IN',
            quantity: item.quantity,
            stockBefore: product.stockActuel,
            stockAfter: product.stockActuel + item.quantity,
            reason: `Réception achat ${purchase.reference}`,
            userId,
          },
        });
      }

      return tx.purchase.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.purchase.update({ where: { id }, data: { status: status as any } });
  }
}
