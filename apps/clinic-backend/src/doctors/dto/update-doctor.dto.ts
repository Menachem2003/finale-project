import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class WorkingHourDto {
  @ApiProperty({ description: "Day of the week", example: "ראשון" })
  @IsNotEmpty()
  @IsString()
  day!: string;

  @ApiProperty({ description: "Work start time", example: "09:00" })
  @IsNotEmpty()
  @IsString()
  workStart!: string;

  @ApiProperty({ description: "Work end time", example: "17:00" })
  @IsNotEmpty()
  @IsString()
  workEnd!: string;
}

export class UpdateDoctorDto {
  @ApiProperty({
    description: "Doctor name",
    example: 'ד"ר יוסי כהן',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Doctor image URL",
    example: "https://example.com/image.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  img?: string;

  @ApiProperty({
    description: "Doctor description",
    example: "מומחה ברפואת שיניים",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Array of specialty IDs",
    example: ["507f1f77bcf86cd799439011"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({
    description: "Working hours",
    type: [WorkingHourDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours?: WorkingHourDto[];
}
