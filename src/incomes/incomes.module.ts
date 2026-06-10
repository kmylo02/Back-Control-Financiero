import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from './income.schema';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }])],
  providers: [IncomesService],
  controllers: [IncomesController],
  exports: [IncomesService],
})
export class IncomesModule {}
