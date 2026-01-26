import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
  })
  name!: string;

  @Prop({
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  })
  email!: string;

  @Prop({
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  })
  password!: string;

  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role!: 'user' | 'admin';
}

export const UserSchema = SchemaFactory.createForClass(User);
