import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvoiceItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  items: IInvoiceItem[];
  total: number;
  createdAt?: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: Number,
    },
  ],
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>("invoices", invoiceSchema);
export default Invoice;
