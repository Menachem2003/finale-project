import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWorkingHour {
  day: string;
  workStart: string;
  workEnd: string;
}

export interface IDoctor extends Document {
  name: string;
  specialties: Types.ObjectId[];
  workingHours: IWorkingHour[];
}

const DoctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true },
  specialties: [
    {
      type: Schema.Types.ObjectId,
      ref: "specialties",
    },
  ],
  workingHours: [
    {
      day: { type: String, required: true },
      workStart: { type: String, required: true },
      workEnd: { type: String, required: true },
    },
  ],
});

const Doctors: Model<IDoctor> = mongoose.model<IDoctor>("doctors", DoctorSchema);
export default Doctors;
