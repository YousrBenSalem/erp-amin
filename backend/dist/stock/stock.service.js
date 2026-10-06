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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StockService = class StockService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockStatus() {
        return this.prisma.product.findMany({
            include: { category: true },
            orderBy: { name: 'asc' },
        });
    }
    async getMovements(productId) {
        return this.prisma.stockMovement.findMany({
            where: productId ? { productId } : undefined,
            include: { product: true, user: true },
            orderBy: { date: 'desc' },
            take: 200,
        });
    }
    async addMovement(data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product)
                throw new common_1.BadRequestException('Produit introuvable');
            let newStock = product.stockActuel;
            if (data.type === 'IN') {
                newStock += data.quantity;
            }
            else if (data.type === 'OUT') {
                if (product.stockActuel < data.quantity) {
                    throw new common_1.BadRequestException('Stock insuffisant');
                }
                newStock -= data.quantity;
            }
            else {
                newStock = data.quantity;
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
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockService);
//# sourceMappingURL=stock.service.js.map