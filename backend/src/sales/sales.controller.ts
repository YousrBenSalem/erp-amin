import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.salesService.createSale(data, req.user.id);
  }

  @Get()
  findAll() { return this.salesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.salesService.findOne(id); }
}
