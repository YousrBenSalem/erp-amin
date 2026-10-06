import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getStockStatus() { return this.stockService.getStockStatus(); }

  @Get('movements')
  getMovements(@Query('productId') productId?: string) {
    return this.stockService.getMovements(productId);
  }

  @Post('movements')
  addMovement(@Body() data: any, @Request() req: any) {
    return this.stockService.addMovement(data, req.user.id);
  }
}
