import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  count: number;
  category: string;
  img?: string;
  createdAt?: Date;
}

const ProductsSchema = new Schema<IProduct>({
  name: String,
  description: String,
  price: Number,
  count: Number,
  category: String,
  img: String,
  createdAt: { type: Date, default: Date.now },
});

const Products: Model<IProduct> = mongoose.model<IProduct>("products", ProductsSchema);
export default Products;
