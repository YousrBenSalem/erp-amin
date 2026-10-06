import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll() { return this.invoicesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.invoicesService.findOne(id); }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.invoicesService.cancel(id); }
}
