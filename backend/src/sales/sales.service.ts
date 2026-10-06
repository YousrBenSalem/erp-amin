import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sale.findMany({
      include: { customer: true, items: { include: { product: true } }, invoice: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } }, invoice: true },
    });
  }

  async createSale(data: any, userId: string) {
    return await this.prisma.$transaction(async (tx: any) => {
      const year = new Date().getFullYear();
      const count = await tx.sale.count();
      const reference = `VT-${year}-${String(count + 1).padStart(5, '0')}`;

      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          reference,
          type: data.type,
          customerId: data.customerId || null,
          subtotal: data.subtotal,
          discount: data.discount || 0,
          tax: data.tax || 0,
          total: data.total,
          paidAmount: data.paidAmount || 0,
          paymentMethod: data.paymentMethod || 'CASH',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
              subtotal: item.quantity * item.price * (1 - (item.discount || 0) / 100),
            })),
          },
        },
      });

      // 2. Update Stock
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new BadRequestException(`Produit introuvable`);
        if (product.stockActuel < item.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${product.name} (disponible: ${product.stockActuel})`);
        }

        const newStock = product.stockActuel - item.quantity;
        await tx.product.update({ where: { id: product.id }, data: { stockActuel: newStock } });

        await tx.stockMovement.create({
          data: {
            reference: `MVT-${Date.now()}-${product.id}`,
            productId: product.id,
            type: 'OUT',
            quantity: item.quantity,
            stockBefore: product.stockActuel,
            stockAfter: newStock,
            reason: `Vente ${reference}`,
            userId,
          },
        });
      }

      // 3. Create Invoice
      const invoiceCount = await tx.invoice.count();
      const invoiceRef = `FAC-${year}-${String(invoiceCount + 1).padStart(5, '0')}`;
      const invoiceStatus = data.paidAmount >= data.total ? 'PAID' : data.paidAmount > 0 ? 'PARTIAL' : 'UNPAID';

      const invoice = await tx.invoice.create({
        data: {
          reference: invoiceRef,
          saleId: sale.id,
          customerId: data.customerId || null,
          subtotal: data.subtotal,
          tax: data.tax || 0,
          total: data.total,
          paidAmount: data.paidAmount || 0,
          status: invoiceStatus as any,
        },
      });

      // 4. Create Payment if paid
      if (data.paidAmount > 0) {
        const payCount = await tx.payment.count();
        await tx.payment.create({
          data: {
            reference: `PAY-${year}-${String(payCount + 1).padStart(5, '0')}`,
            invoiceId: invoice.id,
            customerId: data.customerId || null,
            amount: data.paidAmount,
            method: data.paymentMethod || 'CASH',
            userId,
            date: new Date(data.paymentDate || new Date()),
          },
        });
      }

      // 5. Update Customer Balance if credit
      if (data.customerId && data.paidAmount < data.total) {
        const debt = data.total - data.paidAmount;
        const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
        if (customer) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: { balance: customer.balance + debt },
          });
        }
      }

      // 6. Activity log
      await tx.activityLog.create({
        data: {
          userId,
          action: 'CREATE_SALE',
          entity: 'Sale',
          entityId: sale.id,
          details: `Vente ${reference} - Total: ${data.total} DT`,
        },
      });

      return { sale, invoice };
    });
  }
}
