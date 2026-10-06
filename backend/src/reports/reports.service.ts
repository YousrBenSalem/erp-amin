import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { date: 'desc' },
    });

    const totalRevenue = sales.reduce((sum: number, s: any) => sum + s.total, 0);
    const totalSales = sales.length;
    const wholesaleSales = sales.filter((s: any) => s.type === 'WHOLESALE').length;
    const retailSales = sales.filter((s: any) => s.type === 'RETAIL').length;

    return { sales, totalRevenue, totalSales, wholesaleSales, retailSales };
  }

  async getStockReport() {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { stockActuel: 'asc' },
    });
    const outOfStock = products.filter((p: any) => p.stockActuel <= 0);
    const lowStock = products.filter((p: any) => p.stockActuel > 0 && p.stockActuel <= p.stockMinimum);
    const totalValue = products.reduce((sum: number, p: any) => sum + p.stockActuel * p.prixAchat, 0);
    return { products, outOfStock, lowStock, totalValue };
  }

  async getTopProducts(limit = 10) {
    const saleItems = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const products = await Promise.all(
      saleItems.map(async (item: any) => {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        return { product, totalSold: item._sum.quantity };
      })
    );
    return products;
  }

  async getDashboardStats(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.date = { gte: today };
    }

    const [salesStats, productsCount, customersCount, credits, outOfStock, monthSales] = await Promise.all([
      this.prisma.sale.aggregate({ where, _sum: { total: true }, _count: true }),
      this.prisma.product.count(),
      this.prisma.customer.count(),
      this.prisma.customer.aggregate({ _sum: { balance: true } }),
      this.prisma.product.count({ where: { stockActuel: { lte: 0 } } }),
      this.prisma.sale.aggregate({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      revenue: salesStats._sum.total || 0,
      salesCount: salesStats._count,
      monthRevenue: monthSales._sum.total || 0,
      productsCount,
      customersCount,
      totalCredits: credits._sum.balance || 0,
      outOfStock,
    };
  }
}
