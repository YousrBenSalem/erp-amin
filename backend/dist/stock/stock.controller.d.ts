import { StockService } from './stock.service';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getStockStatus(): Promise<({
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
    })[]>;
    getMovements(productId?: string): Promise<({
        user: {
            id: string;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
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
        reference: string;
        type: import(".prisma/client").$Enums.MovementType;
        quantity: number;
        stockBefore: number;
        stockAfter: number;
        reason: string | null;
        date: Date;
        productId: string;
        userId: string;
    })[]>;
    addMovement(data: any, req: any): Promise<any>;
}
