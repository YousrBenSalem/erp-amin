import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const setting = await this.prisma.setting.findFirst();
    return setting || this.createDefault();
  }

  private async createDefault() {
    return this.prisma.setting.create({
      data: {
        companyName: 'Société AMIN',
        address: 'Tunis, Tunisie',
        phone: '+216 00 000 000',
        email: 'contact@amin.tn',
        currency: 'DT',
        taxRate: 19,
        allowNegativeStock: false,
      },
    });
  }

  async update(data: any) {
    const existing = await this.prisma.setting.findFirst();
    const safeData = { ...data };

    delete safeData.id;
    delete safeData.createdAt;
    delete safeData.updatedAt;

    if (existing) {
      if (Object.keys(safeData).length === 0) {
        return existing;
      }

      return this.prisma.setting.update({
        where: { id: existing.id },
        data: safeData,
      });
    }

    if (Object.keys(safeData).length === 0) {
      return this.createDefault();
    }

    return this.prisma.setting.create({ data: safeData });
  }
}
