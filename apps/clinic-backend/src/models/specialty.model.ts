import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpecialty extends Document {
  specialtyName: string;
  appointmentDuration: number;
}

const specialtySchema = new Schema<ISpecialty>({
  specialtyName: { type: String, required: true, unique: true },
  appointmentDuration: { type: Number, required: true, default: 30 }, // the time in minutes 30, 60, 90
});

const Specialty: Model<ISpecialty> = mongoose.model<ISpecialty>("specialties", specialtySchema);
export default Specialty;
