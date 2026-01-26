import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @ApiProperty({ required: false, description: 'Product name filter' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    required: false,
    description: 'Minimum price',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum price',
    default: Infinity,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max?: number;
}
