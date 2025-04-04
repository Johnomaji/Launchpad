import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@users/schemas/users.schema';

@Schema({ timestamps: true })
export class Memecoin extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  ticker: string;

  @Prop({ required: true })
  coinAddress: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  creator: User;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  desc: string;

  @Prop({ default: 0 })
  totalCoins: number;

  @Prop({ default: '' })
  xSocial: string;

  @Prop({ default: '' })
  telegramSocial: string;

  @Prop({ default: '' })
  discordSocial: string;
}

export const MemecoinSchema = SchemaFactory.createForClass(Memecoin);
