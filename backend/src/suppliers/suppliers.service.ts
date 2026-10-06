import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { purchases: true },
    });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable');
    return supplier;
  }

  async create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }
}
