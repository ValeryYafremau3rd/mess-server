import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class OneTimePreKey {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  key: string;
}

@Schema()
class SignedPreKey {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  signature: string;
}

@Schema({ timestamps: true })
export class KeyBundle extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true })
  registrationId: number;

  @Prop({ required: true })
  identityKey: string;

  @Prop({ type: SignedPreKey, required: true })
  signedPreKey: SignedPreKey;

  @Prop({ type: [OneTimePreKey], default: [] })
  oneTimePreKeys: OneTimePreKey[];
}

export const KeyBundleSchema = SchemaFactory.createForClass(KeyBundle);
