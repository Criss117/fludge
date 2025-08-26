import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignInRootUserUseCase } from './use-cases/sign-in-root-user.usecase';
import { SignUpRootUserUseCase } from './use-cases/sign-up-root-user.usecase';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JWTStrategy } from './strategies/jwt.strategy';
import { BusinessModule } from '@core/business/business.module';
import { SignInEmployeeUseCase } from './use-cases/sign-in-employee.usecase';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    BusinessModule,
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
  providers: [
    SignInRootUserUseCase,
    SignUpRootUserUseCase,
    JWTStrategy,
    SignInEmployeeUseCase,
  ],
})
export class AuthModule {}
