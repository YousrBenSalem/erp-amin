import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Product[]>;
    findOne(id: string): Promise<Product | null>;
    create(data: Prisma.ProductCreateInput): Promise<Product>;
    update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
    remove(id: string): Promise<Product>;
}
