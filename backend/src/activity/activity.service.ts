import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async log(userId: string, action: string, entity: string, entityId: string, details?: string) {
    return this.prisma.activityLog.create({
      data: { userId, action, entity, entityId, details },
    });
  }
}
