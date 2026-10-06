import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany({
      include: { customer: true, invoice: true, user: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const amount = Number(data.amount || 0);
      if (!amount || amount <= 0) {
        throw new BadRequestException('Le montant doit être supérieur à 0');
      }

      if (data.invoiceId) {
        const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (!invoice) throw new BadRequestException('Facture introuvable');
        const remaining = invoice.total - invoice.paidAmount;
        if (amount > remaining) {
          throw new BadRequestException(`Le montant dépasse le restant (${remaining.toFixed(2)} DT)`);
        }
      }

      const paymentDate = new Date(data.date || new Date());
      const year = paymentDate.getFullYear();
      const count = await tx.payment.count();
      const reference = `PAY-${year}-${String(count + 1).padStart(5, '0')}`;

      const payment = await tx.payment.create({
        data: {
          reference,
          invoiceId: data.invoiceId || null,
          customerId: data.customerId || null,
          amount,
          method: data.method || 'CASH',
          userId,
          notes: data.notes,
          date: paymentDate,
        },
        include: { customer: true, invoice: true },
      });

      if (data.invoiceId) {
        const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (invoice) {
          const newPaid = invoice.paidAmount + amount;
          const newStatus = newPaid >= invoice.total ? 'PAID' : 'PARTIAL';
          await tx.invoice.update({
            where: { id: data.invoiceId },
            data: { paidAmount: newPaid, status: newStatus },
          });
        }
      }

      if (data.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
        if (customer) {
          const customerBalance = Number(customer.balance || 0);
          const updatedBalance = customerBalance - amount;
          await tx.customer.update({
            where: { id: data.customerId },
            data: { balance: Math.max(0, updatedBalance) },
          });
        }
      }

      return payment;
    });
  }
}
