import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export type AppointmentStatus = 'הושלם' | 'בוטל' | 'נקבע';

@Schema()
export class Appointment {
  @Prop({
    type: Types.ObjectId,
    ref: 'doctors',
    required: true,
  })
  doctorId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'specialties',
  })
  specialtyId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'users',
    required: true,
  })
  patientId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  duration!: number;

  @Prop({
    type: String,
    enum: ['הושלם', 'בוטל', 'נקבע'],
    default: 'נקבע',
  })
  status!: AppointmentStatus;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
