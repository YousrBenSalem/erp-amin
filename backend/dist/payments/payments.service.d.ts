import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
            company: string | null;
            phone: string | null;
            address: string | null;
            matriculeFiscal: string | null;
            creditLimit: number | null;
            balance: number;
        };
        invoice: {
            id: string;
            reference: string;
            date: Date;
            customerId: string | null;
            subtotal: number;
            tax: number;
            total: number;
            paidAmount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            saleId: string;
            dueDate: Date | null;
        };
    } & {
        id: string;
        reference: string;
        date: Date;
        userId: string;
        amount: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        invoiceId: string | null;
        customerId: string | null;
    })[]>;
    create(data: any, userId: string): Promise<any>;
}
