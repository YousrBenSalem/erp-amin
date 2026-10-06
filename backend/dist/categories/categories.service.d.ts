import { Prisma, Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category | null>;
    create(data: Prisma.CategoryCreateInput): Promise<Category>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
    remove(id: string): Promise<Category>;
}
