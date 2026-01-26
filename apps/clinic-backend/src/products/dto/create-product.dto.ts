import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Toothbrush' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Electric toothbrush',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: 'Product stock count', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  count!: number;

  @ApiProperty({ description: 'Product category', example: 'Oral Care' })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  img?: string;
}
