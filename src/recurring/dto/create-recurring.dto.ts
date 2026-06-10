import { IsString, IsNumber, IsMongoId, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { RecurringMode, RecurringType } from '../recurring.schema';

export class CreateRecurringDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsMongoId()
  categoryId: string;

  @IsEnum(RecurringMode)
  @IsOptional()
  mode?: RecurringMode;

  @IsEnum(RecurringType)
  @IsOptional()
  type?: RecurringType;

  @IsNumber()
  @Min(1)
  @Max(28)
  @IsOptional()
  dayOfMonth?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
