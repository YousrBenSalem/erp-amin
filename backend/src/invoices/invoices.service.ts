import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.invoice.findMany({
      include: { customer: true, sale: { include: { items: { include: { product: true } } } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, payments: true, sale: { include: { items: { include: { product: true } } } } },
    });
  }

  async cancel(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
