import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        companyName: string;
        logo: string | null;
        currency: string;
        taxRate: number;
        allowNegativeStock: boolean;
    }>;
    private createDefault;
    update(data: any): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        matriculeFiscal: string | null;
        companyName: string;
        logo: string | null;
        currency: string;
        taxRate: number;
        allowNegativeStock: boolean;
    }>;
}
