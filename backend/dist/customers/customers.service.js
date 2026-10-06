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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { sales: true, invoices: true, payments: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Client introuvable');
        return customer;
    }
    async create(data) {
        return this.prisma.customer.create({ data });
    }
    async update(id, data) {
        return this.prisma.customer.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.customer.update({
            where: { id },
            data: { balance: 0 },
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
        return customers.map((customer) => {
            const creditSales = (customer.sales || []).filter((sale) => Number(sale.total || 0) > Number(sale.paidAmount || 0));
            const creditInvoice = (customer.invoices || []).filter((invoice) => Number(invoice.total || 0) > Number(invoice.paidAmount || 0));
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
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map