import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema()
export class Service {
  @Prop()
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  img?: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
