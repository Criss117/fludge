import { Injectable } from '@nestjs/common';
import { SignInDto } from '../dtos/sign-in.dto';
import { FindOneUserByUseCase } from '@core/users/use-cases/find-one-user-by.usecase';
import { comparePasswords } from 'src/shared/utils/passwords.utils';
import { BadCredentialsException } from '../exceptions/unauthorized.exception';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInRootUserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findOneUserByUseCase: FindOneUserByUseCase,
  ) {}

  public async execute(meta: SignInDto) {
    const user = await this.findOneUserByUseCase.execute({
      email: meta.email,
    });

    const resultOfComparison = await comparePasswords(
      meta.password,
      user.password,
    );

    if (!resultOfComparison) {
      throw new BadCredentialsException();
    }

    const jwt = this.jwtService.sign({
      id: user.id,
    });

    return jwt;
  }
}
