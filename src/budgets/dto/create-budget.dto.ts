import { IsNumber, IsArray, IsOptional, Min, Max, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryLimitDto {
  @IsMongoId()
  categoryId: string;

  @IsNumber()
  @Min(0)
  limit: number;
}

export class CreateBudgetDto {
  @IsNumber()
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(0)
  totalLimit: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CategoryLimitDto)
  categoryLimits?: CategoryLimitDto[];
}
