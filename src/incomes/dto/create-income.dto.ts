import { IsNumber, IsString, IsDateString, IsMongoId, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateIncomeDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsMongoId()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  bank?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
