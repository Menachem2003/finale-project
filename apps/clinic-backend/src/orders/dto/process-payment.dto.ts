import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Payment method',
    example: 'mock',
    default: 'mock',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Cardholder name (for mock payment)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardholderName?: string;
}
