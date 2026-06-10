import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly/:year/:month')
  monthlySummary(
    @CurrentUser() user: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.reportsService.getMonthlySummary(user.id, parseInt(year), parseInt(month));
  }

  @Get('yearly/:year')
  yearlySummary(@CurrentUser() user: any, @Param('year') year: string) {
    return this.reportsService.getYearlySummary(user.id, parseInt(year));
  }

  @Get('compare/:year/:month')
  compareMonths(
    @CurrentUser() user: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.reportsService.compareMonths(user.id, parseInt(year), parseInt(month));
  }

  @Get('year-comparison/:year')
  yearComparison(@CurrentUser() user: any, @Param('year') year: string) {
    return this.reportsService.getYearComparison(user.id, parseInt(year));
  }
}
