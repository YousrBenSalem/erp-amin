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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchasesService = class PurchasesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.purchase.findMany({
            include: { supplier: true, items: { include: { product: true } } },
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: { supplier: true, items: { include: { product: true } } },
        });
        if (!purchase)
            throw new common_1.NotFoundException('Achat introuvable');
        return purchase;
    }
    async create(data) {
        const year = new Date().getFullYear();
        const count = await this.prisma.purchase.count();
        const reference = `ACH-${year}-${String(count + 1).padStart(5, '0')}`;
        const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const finalTotal = subtotal - (data.discount || 0) + (data.fees || 0);
        return this.prisma.purchase.create({
            data: {
                reference,
                supplierId: data.supplierId,
                date: new Date(data.date || new Date()),
                total: subtotal,
                discount: data.discount || 0,
                fees: data.fees || 0,
                finalTotal,
                status: data.status || 'DRAFT',
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { supplier: true, items: true },
        });
    }
    async receive(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!purchase)
                throw new common_1.NotFoundException('Achat introuvable');
            if (purchase.status === 'RECEIVED')
                throw new common_1.BadRequestException('Déjà reçu');
            for (const item of purchase.items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    continue;
                await tx.product.update({
                    where: { id: product.id },
                    data: { stockActuel: product.stockActuel + item.quantity },
                });
                await tx.stockMovement.create({
                    data: {
                        reference: `MVT-${Date.now()}-${product.id}`,
                        productId: product.id,
                        type: 'IN',
                        quantity: item.quantity,
                        stockBefore: product.stockActuel,
                        stockAfter: product.stockActuel + item.quantity,
                        reason: `Réception achat ${purchase.reference}`,
                        userId,
                    },
                });
            }
            return tx.purchase.update({
                where: { id },
                data: { status: 'RECEIVED' },
            });
        });
    }
    async updateStatus(id, status) {
        return this.prisma.purchase.update({ where: { id }, data: { status: status } });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map