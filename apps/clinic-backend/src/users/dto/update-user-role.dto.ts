import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'User role',
    example: 'admin',
    enum: ['user', 'admin'],
  })
  @IsNotEmpty()
  @IsEnum(['user', 'admin'])
  role!: 'user' | 'admin';
}
