import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AppointmentStatus = "הושלם" | "בוטל" | "נקבע";

export interface IAppointment extends Document {
  doctorId: Types.ObjectId;
  specialtyId?: Types.ObjectId;
  patientId: Types.ObjectId;
  date: Date;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
}

const AppointmentSchema = new Schema<IAppointment>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "doctors",
    required: true,
  },
  specialtyId: {
    type: Schema.Types.ObjectId,
    ref: "specialties",
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ["הושלם", "בוטל", "נקבע"],
    default: "נקבע",
  },
});

const Appointments: Model<IAppointment> = mongoose.model<IAppointment>(
  "appointments",
  AppointmentSchema
);
export default Appointments;
