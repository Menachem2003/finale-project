import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReferralStatusDto {
  @ApiProperty({
    description: 'Referral status',
    example: 'read',
    enum: ['new', 'read', 'responded'],
  })
  @IsNotEmpty()
  @IsEnum(['new', 'read', 'responded'])
  status!: 'new' | 'read' | 'responded';
}
