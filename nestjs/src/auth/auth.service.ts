import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { User } from '@users/schemas/users.schema';
import { Challenge } from './schemas/challenge.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
  ) { }

  async generateChallenge(
    address: string,
  ): Promise<{ challenge: string; nonce: string }> {
    const nonce = crypto.randomBytes(16).toString('hex');
    const challenge = `Sign this message to authenticate with our app: ${nonce}`;

    await this.challengeModel.create({
      address,
      challenge,
      nonce,
    });

    return { challenge, nonce };
  }

  async verifySignature(
    address: string,
    signature: string,
    message: string,
  ): Promise<boolean> {
    const challengeRecords = await this.challengeModel
      .find({
        address,
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    const challengeRecord = challengeRecords[0];
    console.log(challengeRecords, await this.challengeModel.find().exec());

    if (!challengeRecord || challengeRecord.challenge !== message) {
      return false;
    }
    const encMsg = new TextEncoder().encode(message);
    console.log(address, signature, message, encMsg);

    try {
      const isValid = await verifyPersonalMessageSignature(encMsg, signature, {
        address,
      });

      if (isValid) {
        const user = await this.userModel
          .findOne({ walletAddress: address })
          .exec();
        console.log('findOne returned: ', user);
        if (!user) {
          console.log('creating user...');
          await this.userModel.create({
            walletAddress: address,
          });
        }
        try {
          await this.challengeModel
            .findByIdAndDelete(challengeRecord._id)
            .exec();
        } catch (deletionError) {
          console.warn('Failed to delete challenge:', deletionError);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async generateToken(address: string): Promise<string> {
    const payload = { sub: address };
    return this.jwtService.sign(payload);
  }
}
