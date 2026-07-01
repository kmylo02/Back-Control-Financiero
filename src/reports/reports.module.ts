import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExpensesModule } from '../expenses/expenses.module';
import { IncomesModule } from '../incomes/incomes.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { BillItemsModule } from '../bill-items/bill-items.module';

@Module({
  imports: [ExpensesModule, IncomesModule, BudgetsModule, BillItemsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
