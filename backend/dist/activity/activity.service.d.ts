import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityService {
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
    } & {
        id: string;
        date: Date;
        userId: string;
        action: string;
        entity: string;
        entityId: string;
        details: string | null;
    })[]>;
    log(userId: string, action: string, entity: string, entityId: string, details?: string): Promise<{
        id: string;
        date: Date;
        userId: string;
        action: string;
        entity: string;
        entityId: string;
        details: string | null;
    }>;
}
