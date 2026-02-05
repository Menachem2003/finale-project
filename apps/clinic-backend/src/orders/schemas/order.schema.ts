import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  price!: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  total!: number;

  @Prop({
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  })
  status!: string;

  @Prop({
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  })
  paymentStatus!: string;

  @Prop({ type: String, default: "paypal" })
  paymentMethod!: string;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  paypalOrderId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
