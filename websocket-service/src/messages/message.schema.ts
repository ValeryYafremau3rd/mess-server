import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Payload {
  @Prop({ required: true })
  type: number;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  registrationId: number;
}

export const PayloadSchema = SchemaFactory.createForClass(Payload);

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true, index: true })
  to: string;

  @Prop({ required: true, index: true })
  from: string;

  @Prop({ default: 'TEXT' })
  type?: string;

  @Prop({ type: PayloadSchema, required: true })
  payload: Payload;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
