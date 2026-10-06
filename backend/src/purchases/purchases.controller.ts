import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Body() data: any) { return this.purchasesService.create(data); }

  @Get()
  findAll() { return this.purchasesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.purchasesService.findOne(id); }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Request() req: any) {
    return this.purchasesService.receive(id, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.purchasesService.updateStatus(id, body.status);
  }
}
