import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema()
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'products',
    required: true,
    unique: true,
  })
  productId!: Types.ObjectId;

  @Prop()
  quantity!: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);
CartItemSchema.set('_id', false);

@Schema()
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'users',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: [CartItemSchema] })
  items!: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
