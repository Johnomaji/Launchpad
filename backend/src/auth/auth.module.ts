import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { User, UserSchema } from '@users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const privateKey = Buffer.from(
          configService.get<string>('JWT_PRIVATE_KEY_BASE64'),
          'base64',
        );
        const publicKey = Buffer.from(
          configService.get<string>('JWT_PUBLIC_KEY_BASE64'),
          'base64',
        );

        return {
          privateKey: {
            key: privateKey,
            passphrase: configService.get<string>('JWT_KEY_PASSPHRASE'),
          },
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '1h',
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService],
})
export class AuthModule {}
