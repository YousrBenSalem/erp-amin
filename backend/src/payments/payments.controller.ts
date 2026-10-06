import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll() { return this.paymentsService.findAll(); }

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.paymentsService.create(data, req.user.id);
  }
}
