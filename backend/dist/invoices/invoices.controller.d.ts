import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(): Promise<({
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
        sale: {
            items: ({
                product: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    reference: string;
                    sku: string | null;
                    categoryId: string;
                    description: string | null;
                    image: string | null;
                    unit: string;
                    prixAchat: number;
                    prixVenteDetail: number;
                    prixVenteGros: number;
                    stockActuel: number;
                    stockMinimum: number;
                    stockMaximum: number | null;
                    fournisseurId: string | null;
                    dateExpiration: Date | null;
                    statut: string;
                };
            } & {
                id: string;
                quantity: number;
                productId: string;
                subtotal: number;
                discount: number;
                saleId: string;
                price: number;
            })[];
        } & {
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
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
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
        sale: {
            items: ({
                product: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    reference: string;
                    sku: string | null;
                    categoryId: string;
                    description: string | null;
                    image: string | null;
                    unit: string;
                    prixAchat: number;
                    prixVenteDetail: number;
                    prixVenteGros: number;
                    stockActuel: number;
                    stockMinimum: number;
                    stockMaximum: number | null;
                    fournisseurId: string | null;
                    dateExpiration: Date | null;
                    statut: string;
                };
            } & {
                id: string;
                quantity: number;
                productId: string;
                subtotal: number;
                discount: number;
                saleId: string;
                price: number;
            })[];
        } & {
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
        };
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
    } & {
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
    }>;
    cancel(id: string): Promise<{
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
    }>;
}
