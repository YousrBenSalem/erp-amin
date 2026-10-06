import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
        payments: {
            id: string;
            reference: string;
            date: Date;
            userId: string;
            amount: number;
            method: import(".prisma/client").$Enums.PaymentMethod;
            notes: string | null;
            invoiceId: string | null;
            customerId: string | null;
        }[];
        sales: {
            id: string;
            reference: string;
            type: import(".prisma/client").$Enums.SaleType;
            date: Date;
            customerId: string | null;
            subtotal: number;
            discount: number;
            tax: number;
            total: number;
            paidAmount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.SaleStatus;
        }[];
        invoices: {
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
        }[];
    } & {
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
    }>;
    create(data: any): Promise<{
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
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    getCredits(): Promise<any[]>;
}
