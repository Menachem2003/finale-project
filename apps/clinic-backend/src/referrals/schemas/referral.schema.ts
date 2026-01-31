import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new',
  })
  status!: 'new' | 'read' | 'responded';
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
