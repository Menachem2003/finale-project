import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  price!: number;

  @Prop()
  count!: number;

  @Prop()
  category!: string;

  @Prop()
  img?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
