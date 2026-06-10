import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';

@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private incomesService: IncomesService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('year') year?: string, @Query('month') month?: string) {
    if (year && month) {
      return this.incomesService.findByMonth(user.id, parseInt(year), parseInt(month));
    }
    return this.incomesService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateIncomeDto) {
    return this.incomesService.create(user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateIncomeDto) {
    return this.incomesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.incomesService.remove(user.id, id);
  }
}
