"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesSummary(from, to) {
        const where = {};
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = new Date(from);
            if (to)
                where.date.lte = new Date(to);
        }
        const sales = await this.prisma.sale.findMany({
            where,
            include: { items: { include: { product: true } }, customer: true },
            orderBy: { date: 'desc' },
        });
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalSales = sales.length;
        const wholesaleSales = sales.filter((s) => s.type === 'WHOLESALE').length;
        const retailSales = sales.filter((s) => s.type === 'RETAIL').length;
        return { sales, totalRevenue, totalSales, wholesaleSales, retailSales };
    }
    async getStockReport() {
        const products = await this.prisma.product.findMany({
            include: { category: true },
            orderBy: { stockActuel: 'asc' },
        });
        const outOfStock = products.filter((p) => p.stockActuel <= 0);
        const lowStock = products.filter((p) => p.stockActuel > 0 && p.stockActuel <= p.stockMinimum);
        const totalValue = products.reduce((sum, p) => sum + p.stockActuel * p.prixAchat, 0);
        return { products, outOfStock, lowStock, totalValue };
    }
    async getTopProducts(limit = 10) {
        const saleItems = await this.prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });
        const products = await Promise.all(saleItems.map(async (item) => {
            const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
            return { product, totalSold: item._sum.quantity };
        }));
        return products;
    }
    async getDashboardStats(from, to) {
        const where = {};
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = new Date(from);
            if (to)
                where.date.lte = new Date(`${to}T23:59:59.999Z`);
        }
        else {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map