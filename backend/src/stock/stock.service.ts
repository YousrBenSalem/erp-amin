import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getStockStatus() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async getMovements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: { product: true, user: true },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async addMovement(data: any, userId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new BadRequestException('Produit introuvable');

      let newStock = product.stockActuel;
      if (data.type === 'IN') {
        newStock += data.quantity;
      } else if (data.type === 'OUT') {
        if (product.stockActuel < data.quantity) {
          throw new BadRequestException('Stock insuffisant');
        }
        newStock -= data.quantity;
      } else {
        newStock = data.quantity; // ADJUSTMENT
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stockActuel: newStock },
      });

      return tx.stockMovement.create({
        data: {
          reference: `MVT-${Date.now()}`,
          productId: product.id,
          type: data.type,
          quantity: data.quantity,
          stockBefore: product.stockActuel,
          stockAfter: newStock,
          reason: data.reason || 'Ajustement manuel',
          userId,
        },
        include: { product: true },
      });
    });
  }
}
