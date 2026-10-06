import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
