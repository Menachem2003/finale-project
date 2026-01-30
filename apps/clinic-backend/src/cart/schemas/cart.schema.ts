import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
    index: false, // Explicitly disable indexing to prevent unique constraint issues
  })
  productId!: Types.ObjectId;

  @Prop()
  quantity!: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema()
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'users',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ 
    type: [CartItemSchema],
    default: [],
  })
  items!: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Remove any problematic unique indexes on items.productId
// This prevents the E11000 duplicate key error
CartSchema.index({ 'items.productId': 1 }, { unique: false, sparse: true });
