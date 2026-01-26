import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetAvailableSlotsDto {
  @ApiProperty({
    description: 'Specialty ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  specialtyId!: string;

  @ApiProperty({
    description: 'Date in ISO format',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsString()
  date!: string;
}
