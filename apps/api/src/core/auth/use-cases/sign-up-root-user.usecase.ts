import { Injectable } from '@nestjs/common';
import { CreateRootUserDto } from 'src/core/users/dtos/create-root-user.dto';
import { CreateRootUserUseCase } from 'src/core/users/use-cases/create-root-user.usecase';

@Injectable()
export class SignUpRootUserUseCase {
  constructor(private readonly createRootUserUseCase: CreateRootUserUseCase) {}

  public async execute(data: CreateRootUserDto) {
    return this.createRootUserUseCase.execute(data);
  }
}
