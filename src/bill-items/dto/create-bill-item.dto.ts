import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsBoolean, Min, Max } from 'class-validator';

export class CreateBillItemDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsNumber() @Min(0)
  amount: number;

  @IsOptional() @IsMongoId()
  categoryId?: string;

  @IsNumber() @Min(1) @Max(31)
  dueDay: number;

  @IsNumber()
  year: number;

  @IsNumber() @Min(1) @Max(12)
  month: number;

  @IsOptional() @IsBoolean()
  isRecurring?: boolean;

  @IsOptional() @IsString()
  notes?: string;
}
