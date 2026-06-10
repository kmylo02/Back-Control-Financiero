import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { CategoryType } from '../category.schema';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
