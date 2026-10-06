import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getSalesSummary(from, to);
  }

  @Get('stock')
  getStockReport() { return this.reportsService.getStockReport(); }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.reportsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get('dashboard')
  getDashboardStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getDashboardStats(from, to);
  }
}
