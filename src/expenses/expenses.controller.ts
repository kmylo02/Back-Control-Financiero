import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('year') year?: string, @Query('month') month?: string) {
    if (year && month) {
      return this.expensesService.findByMonth(user.id, parseInt(year), parseInt(month));
    }
    return this.expensesService.findAll(user.id);
  }

  @Get('summary')
  summary(@CurrentUser() user: any, @Query('year') year: string, @Query('month') month: string) {
    return this.expensesService.getByCategoryForMonth(user.id, parseInt(year), parseInt(month));
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateExpenseDto) {
    return this.expensesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.remove(user.id, id);
  }
}
