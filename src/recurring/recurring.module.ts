import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recurring, RecurringSchema } from './recurring.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { Income, IncomeSchema } from '../incomes/income.schema';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recurring.name, schema: RecurringSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
  ],
  providers: [RecurringService],
  controllers: [RecurringController],
  exports: [RecurringService],
})
export class RecurringModule {}
