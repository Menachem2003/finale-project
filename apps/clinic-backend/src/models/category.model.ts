import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  categoryCode: string;
}

const categorySchema = new Schema<ICategory>({
  name: String,
  categoryCode: String,
});

const Category: Model<ICategory> = mongoose.model<ICategory>("categories", categorySchema);
export default Category;
