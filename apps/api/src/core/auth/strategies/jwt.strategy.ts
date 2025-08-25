import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from '../dtos/jwt-payload.dto';
import { FindOneUserByUseCase } from '@core/users/use-cases/find-one-user-by.usecase';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly findOneUserByUseCase: FindOneUserByUseCase,
  ) {
    const secret = configService.getOrThrow('JWT_SECRET');

    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: JWTPayload) {
    const user = await this.findOneUserByUseCase.execute({
      id: payload.id,
    });

    return user;
  }
}
