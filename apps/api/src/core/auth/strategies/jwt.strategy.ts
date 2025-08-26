import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from '../dtos/jwt-payload.dto';
import { FindOneUserByUseCase } from '@core/users/use-cases/find-one-user-by.usecase';
import { FindUserIsInUseCase } from '@core/business/use-cases/find-user-is-in.usecase';
import { LogedUser } from '@repo/core/entities/user';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly findOneUserByUseCase: FindOneUserByUseCase,
    private readonly findUserIsInUseCase: FindUserIsInUseCase,
  ) {
    const secret = configService.getOrThrow('JWT_SECRET');

    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: JWTPayload): Promise<LogedUser> {
    const user = await this.findOneUserByUseCase.execute({
      id: payload.id,
    });

    const { isEmployeeIn, isRootIn } = await this.findUserIsInUseCase.execute(
      payload.id,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      isActive: user.isActive,
      isAccountValidated: user.isAccountValidated,
      isRoot: user.isRoot,
      isEmployeeIn,
      isRootIn,
    };
  }
}
