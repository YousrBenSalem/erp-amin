import { Prisma } from '@prisma/client';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(data: Prisma.CategoryCreateInput): Promise<{
        id: string;
        name: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
    }>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<{
        id: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
    }>;
}
