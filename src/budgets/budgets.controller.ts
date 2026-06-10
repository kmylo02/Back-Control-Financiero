import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.upsert(user.id, dto);
  }

  @Get(':year/:month')
  findByMonth(
    @CurrentUser() user: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.budgetsService.findByMonth(user.id, parseInt(year), parseInt(month));
  }

  @Get(':year')
  findByYear(@CurrentUser() user: any, @Param('year') year: string) {
    return this.budgetsService.findByYear(user.id, parseInt(year));
  }

  @Delete(':year/:month')
  remove(
    @CurrentUser() user: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.budgetsService.remove(user.id, parseInt(year), parseInt(month));
  }
}
