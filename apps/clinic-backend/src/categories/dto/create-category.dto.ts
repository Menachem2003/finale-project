import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Oral Care' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Category code',
    example: 'ORAL_CARE',
  })
  @IsNotEmpty()
  @IsString()
  categoryCode!: string;
}
