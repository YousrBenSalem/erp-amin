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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.payment.findMany({
            include: { customer: true, invoice: true, user: true },
            orderBy: { date: 'desc' },
        });
    }
    async create(data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const amount = Number(data.amount || 0);
            if (!amount || amount <= 0) {
                throw new common_1.BadRequestException('Le montant doit être supérieur à 0');
            }
            if (data.invoiceId) {
                const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
                if (!invoice)
                    throw new common_1.BadRequestException('Facture introuvable');
                const remaining = invoice.total - invoice.paidAmount;
                if (amount > remaining) {
                    throw new common_1.BadRequestException(`Le montant dépasse le restant (${remaining.toFixed(2)} DT)`);
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map