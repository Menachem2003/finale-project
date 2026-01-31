import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateReferralDto {
  @ApiProperty({
    description: 'Full name of the person making the referral',
    example: 'יוסי כהן',
  })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'yossi@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '050-1234567',
  })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'Reason for the referral',
    example: 'בקשה לתור',
  })
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'אני מעוניין לקבוע תור לבדיקה',
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}
