import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignInUserUseCase } from './use-cases/sign-in.usecase';
import { SignUpUserUseCase } from './use-cases/sign-up.usercase';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow('JWT_SECRET');

        return {
          secret,
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [SignInUserUseCase, SignUpUserUseCase, JWTStrategy],
})
export class AuthModule {}
