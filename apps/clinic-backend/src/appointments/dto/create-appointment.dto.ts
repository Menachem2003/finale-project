import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  doctorId!: string;

  @ApiProperty({
    description: 'Date in ISO format',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsString()
  date!: string;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @ApiProperty({
    description: 'Patient ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @ApiProperty({
    description: 'Specialty ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  specialtyId!: string;
}
