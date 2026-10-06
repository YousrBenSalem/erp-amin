import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Body() data: any) { return this.suppliersService.create(data); }

  @Get()
  findAll() { return this.suppliersService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.suppliersService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.suppliersService.update(id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.suppliersService.remove(id); }
}
