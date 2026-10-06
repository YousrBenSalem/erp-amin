import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        supplier: {
            id: string;
            email: string | null;
            name: string;
            notes: string | null;
            phone: string | null;
            address: string | null;
            matriculeFiscal: string | null;
            contactName: string | null;
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
            price: number;
            purchaseId: string;
        })[];
    } & {
        id: string;
        reference: string;
        date: Date;
        discount: number;
        total: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        supplierId: string;
        fees: number;
        finalTotal: number;
    })[]>;
    findOne(id: string): Promise<{
        supplier: {
            id: string;
            email: string | null;
            name: string;
            notes: string | null;
            phone: string | null;
            address: string | null;
            matriculeFiscal: string | null;
            contactName: string | null;
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
            price: number;
            purchaseId: string;
        })[];
    } & {
        id: string;
        reference: string;
        date: Date;
        discount: number;
        total: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        supplierId: string;
        fees: number;
        finalTotal: number;
    }>;
    create(data: any): Promise<{
        supplier: {
            id: string;
            email: string | null;
            name: string;
            notes: string | null;
            phone: string | null;
            address: string | null;
            matriculeFiscal: string | null;
            contactName: string | null;
        };
        items: {
            id: string;
            quantity: number;
            productId: string;
            price: number;
            purchaseId: string;
        }[];
    } & {
        id: string;
        reference: string;
        date: Date;
        discount: number;
        total: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        supplierId: string;
        fees: number;
        finalTotal: number;
    }>;
    receive(id: string, userId: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        reference: string;
        date: Date;
        discount: number;
        total: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        supplierId: string;
        fees: number;
        finalTotal: number;
    }>;
}
