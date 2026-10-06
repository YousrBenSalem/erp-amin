import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() data: any) { return this.customersService.create(data); }

  @Get()
  findAll() { return this.customersService.findAll(); }

  @Get('credits')
  getCredits() { return this.customersService.getCredits(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.customersService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.customersService.update(id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.customersService.remove(id); }
}
