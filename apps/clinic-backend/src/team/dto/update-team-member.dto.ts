import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTeamMemberDto {
  @ApiProperty({
    description: 'Team member name',
    example: 'דר\' וולקוב מרינה מנהלת רפואית',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Team member image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  img?: string;

  @ApiProperty({
    description: 'Team member description',
    example: 'סיימה בהצטיינות בפקולטה לרפואת שיניים...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
