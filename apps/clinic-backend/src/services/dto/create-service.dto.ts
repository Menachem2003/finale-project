import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name', example: 'Dental Cleaning' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional dental cleaning service',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  img?: string;
}
