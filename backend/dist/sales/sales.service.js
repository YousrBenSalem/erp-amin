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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.sale.findMany({
            include: { customer: true, items: { include: { product: true } }, invoice: true },
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.sale.findUnique({
            where: { id },
            include: { customer: true, items: { include: { product: true } }, invoice: true },
        });
    }
    async createSale(data, userId) {
        return await this.prisma.$transaction(async (tx) => {
            const year = new Date().getFullYear();
            const count = await tx.sale.count();
            const reference = `VT-${year}-${String(count + 1).padStart(5, '0')}`;
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
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            discount: item.discount || 0,
                            subtotal: item.quantity * item.price * (1 - (item.discount || 0) / 100),
                        })),
                    },
                },
            });
            for (const item of data.items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    throw new common_1.BadRequestException(`Produit introuvable`);
                if (product.stockActuel < item.quantity) {
                    throw new common_1.BadRequestException(`Stock insuffisant pour ${product.name} (disponible: ${product.stockActuel})`);
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
                    status: invoiceStatus,
                },
            });
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
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map