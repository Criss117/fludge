import { Injectable } from '@nestjs/common';
import { SignInDto } from '../dtos/sign-in.dto';
import { FindOneUserByUseCase } from '@core/users/use-cases/find-one-user-by.usecase';
import { comparePasswords } from 'src/shared/utils/passwords.utils';
import { BadCredentialsExeption } from '../exeptions/unauthorized.exeptions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInUserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findOneUserByUseCase: FindOneUserByUseCase,
  ) {}

  public async execute(data: SignInDto) {
    const user = await this.findOneUserByUseCase.execute({
      email: data.email,
    });

    const resultOfComparison = await comparePasswords(
      data.password,
      user.password,
    );

    if (!resultOfComparison) {
      throw new BadCredentialsExeption();
    }

    const jwt = this.jwtService.sign({
      id: user.id,
    });

    return jwt;
  }
}
