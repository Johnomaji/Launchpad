import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@users/schemas/users.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Memecoin extends Document {
  @ApiProperty({
    description: 'The unique name of the memecoin',
    example: 'Shiba Blast',
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    description: 'Ticker symbol of the memecoin',
    example: 'SHIB',
  })
  @Prop({ required: true })
  ticker: string;

  @ApiProperty({
    description: 'Smart contract address of the memecoin',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @Prop({ required: true })
  coinAddress: string;

  @ApiProperty({
    description: 'Reference to the creator (user)',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  creator: User;

  @ApiProperty({
    description: 'Image URL for the memecoin',
    example: 'https://example.com/image.png',
    required: false,
  })
  @Prop({ default: '' })
  image: string;

  @ApiProperty({
    description: 'Description of the memecoin',
    example: 'A fun token with community backing.',
    required: false,
  })
  @Prop({ default: '' })
  desc: string;

  @ApiProperty({
    description: 'Total number of coins in circulation',
    example: 1000000,
    required: false,
  })
  @Prop({ default: 0 })
  totalCoins: number;

  @ApiProperty({
    description: 'Twitter or X handle/link of the project',
    example: 'https://x.com/shibablast',
    required: false,
  })
  @Prop({ default: '' })
  xSocial: string;

  @ApiProperty({
    description: 'Telegram group link',
    example: 'https://t.me/shibablastgroup',
    required: false,
  })
  @Prop({ default: '' })
  telegramSocial: string;

  @ApiProperty({
    description: 'Discord invite link',
    example: 'https://discord.gg/shibablast',
    required: false,
  })
  @Prop({ default: '' })
  discordSocial: string;
}

export const MemecoinSchema = SchemaFactory.createForClass(Memecoin);
