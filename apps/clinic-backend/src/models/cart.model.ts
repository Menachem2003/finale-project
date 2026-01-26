import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      unique: true,
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: Number,
  },
  {
    _id: false,
  }
);

const cartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [cartItemSchema],
});

const CartModel: Model<ICart> = mongoose.model<ICart>("carts", cartSchema);
export default CartModel;
