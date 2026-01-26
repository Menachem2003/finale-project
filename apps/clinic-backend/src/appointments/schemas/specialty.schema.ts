import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecialtyDocument = Specialty & Document;

@Schema()
export class Specialty {
  @Prop({ required: true, unique: true })
  specialtyName!: string;

  @Prop({ required: true, default: 30 })
  appointmentDuration!: number;
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty);
