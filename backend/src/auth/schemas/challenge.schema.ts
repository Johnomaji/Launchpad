import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Challenge extends Document {
  @ApiProperty({
    description: 'The wallet address associated with the challenge',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @Prop({ required: true })
  address: string;

  @ApiProperty({
    description: 'The challenge string issued to the user',
    example: 'Sign this challenge to authenticate: 9f9d5...',
  })
  @Prop({ required: true })
  challenge: string;

  @ApiProperty({
    description: 'A unique nonce for the challenge',
    example: 'a1b2c3d4e5',
  })
  @Prop({ required: true })
  nonce: string;

  @ApiProperty({
    description:
      'Date when the challenge expires (auto-deletes after 5 minutes)',
    example: new Date().toISOString(),
  })
  @Prop({ required: true, default: Date.now, expires: 300 })
  expiresAt: Date;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
