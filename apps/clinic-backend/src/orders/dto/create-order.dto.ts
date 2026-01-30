import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    description: 'Price of the product at time of order',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({
    description: 'Total amount of the order',
    example: 199.98,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total!: number;
}
