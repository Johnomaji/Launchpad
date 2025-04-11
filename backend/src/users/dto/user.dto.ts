import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  _id: Schema.Types.ObjectId;

  @ApiProperty({
    description: "User's wallet address",
    required: true,
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  })
  walletAddress: string;

  @ApiProperty({
    description: "User's unique username",
    required: false,
    example: 'crypto_ninja',
  })
  username: string;

  @ApiProperty({
    description: "User's biography",
    required: false,
    example: 'Blockchain enthusiast and NFT collector',
  })
  bio: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-04-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-04-02T15:30:00.000Z',
  })
  updatedAt: Date;
}
