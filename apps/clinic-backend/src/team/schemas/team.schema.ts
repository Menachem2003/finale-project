import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  img?: string;

  @Prop({ trim: true })
  description?: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
