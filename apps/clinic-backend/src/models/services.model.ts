import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  name: string;
  description?: string;
  img?: string;
}

const servicesSchema = new Schema<IService>({
  name: String,
  description: String,
  img: String,
});

const ServiceModel: Model<IService> = mongoose.model<IService>("services", servicesSchema);
export default ServiceModel;
