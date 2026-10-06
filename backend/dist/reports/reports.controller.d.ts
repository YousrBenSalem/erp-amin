import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSalesSummary(from?: string, to?: string): Promise<{
        sales: ({
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
        })[];
        totalRevenue: any;
        totalSales: number;
        wholesaleSales: number;
        retailSales: number;
    }>;
    getStockReport(): Promise<{
        products: ({
            category: {
                id: string;
                name: string;
            };
        } & {
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
        })[];
        outOfStock: ({
            category: {
                id: string;
                name: string;
            };
        } & {
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
        })[];
        lowStock: ({
            category: {
                id: string;
                name: string;
            };
        } & {
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
        })[];
        totalValue: number;
    }>;
    getTopProducts(limit?: string): Promise<{
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
        totalSold: any;
    }[]>;
    getDashboardStats(from?: string, to?: string): Promise<{
        revenue: number;
        salesCount: number;
        monthRevenue: number;
        productsCount: number;
        customersCount: number;
        totalCredits: number;
        outOfStock: number;
    }>;
}
