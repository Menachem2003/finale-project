import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Oral Care' })
  @IsNotEmpty()
  @IsString()
  name!: string;
}
