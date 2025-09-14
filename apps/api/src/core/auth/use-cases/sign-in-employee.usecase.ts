import { FindOneUserByUseCase } from '@core/users/use-cases/find-one-user-by.usecase';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/shared/utils/passwords.utils';
import { BadCredentialsExeption } from '../exeptions/unauthorized.exeptions';
import { SignInEmployeeDto } from '../dtos/sign-in.dto';

@Injectable()
export class SignInEmployeeUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findOneUserByUseCase: FindOneUserByUseCase,
  ) {}

  public async execute(meta: SignInEmployeeDto) {
    const user = await this.findOneUserByUseCase.execute({
      username: meta.username,
    });

    const resultOfComparison = await comparePasswords(
      meta.password,
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
