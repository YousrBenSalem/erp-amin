import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
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
}
