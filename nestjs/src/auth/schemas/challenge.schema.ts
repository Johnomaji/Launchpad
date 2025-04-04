import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Challenge extends Document {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  challenge: string;

  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true, default: Date.now, expires: 300 })
  expiresAt: Date;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
