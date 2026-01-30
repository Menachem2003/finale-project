import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema()
export class WorkingHour {
  @Prop({ required: true })
  day!: string;

  @Prop({ required: true })
  workStart!: string;

  @Prop({ required: true })
  workEnd!: string;
}

const WorkingHourSchema = SchemaFactory.createForClass(WorkingHour);

@Schema()
export class Doctor {
  @Prop({ required: true })
  name!: string;

  @Prop()
  img?: string;

  @Prop()
  description?: string;

  @Prop([
    {
      type: Types.ObjectId,
      ref: 'specialties',
    },
  ])
  specialties!: Types.ObjectId[];

  @Prop({ type: [WorkingHourSchema] })
  workingHours!: WorkingHour[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
