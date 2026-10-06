import { PrismaService } from '../prisma/prisma.service';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string | null;
        name: string;
        notes: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        contactName: string | null;
    }[]>;
    findOne(id: string): Promise<{
        purchases: {
            id: string;
            reference: string;
            date: Date;
            discount: number;
            total: number;
            status: import(".prisma/client").$Enums.PurchaseStatus;
            supplierId: string;
            fees: number;
            finalTotal: number;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        notes: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        contactName: string | null;
    }>;
    create(data: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        notes: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        contactName: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        notes: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        contactName: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        notes: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        contactName: string | null;
    }>;
}
