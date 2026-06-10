import { IsNumber, IsString, IsDateString, IsMongoId, IsEnum, IsOptional, IsBoolean, Min } from 'class-validator';
import { ExpenseMode } from '../expense.schema';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsMongoId()
  categoryId: string;

  @IsEnum(ExpenseMode)
  @IsOptional()
  mode?: ExpenseMode;

  @IsMongoId()
  @IsOptional()
  recurringId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
