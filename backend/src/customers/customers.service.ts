import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { sales: true, invoices: true, payments: true },
    });
    if (!customer) throw new NotFoundException('Client introuvable');
    return customer;
  }

  async create(data: any) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { balance: 0 }, // soft approach
    });
  }

  async getCredits() {
    const customers = await this.prisma.customer.findMany({
      where: { balance: { gt: 0 } },
      orderBy: { balance: 'desc' },
      include: {
        sales: {
          orderBy: { date: 'desc' },
          include: { invoice: true },
        },
        invoices: {
          orderBy: { date: 'desc' },
        },
      },
    });

    return customers.map((customer: any) => {
      const creditSales = (customer.sales || []).filter((sale: any) => Number(sale.total || 0) > Number(sale.paidAmount || 0));
      const creditInvoice = (customer.invoices || []).filter((invoice: any) => Number(invoice.total || 0) > Number(invoice.paidAmount || 0));

      const latestCreditSale = creditSales[0] || null;
      const latestCreditInvoice = creditInvoice[0] || null;
      const latestCredit = latestCreditSale || latestCreditInvoice;

      return {
        ...customer,
        creditDate: latestCredit?.date || customer.createdAt || new Date(),
        saleReference: latestCreditSale?.reference || null,
        invoiceReference: latestCreditInvoice?.reference || latestCreditSale?.invoice?.reference || null,
      };
    });
  }
}
