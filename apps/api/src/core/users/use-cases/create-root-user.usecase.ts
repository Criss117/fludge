import { Injectable } from '@nestjs/common';
import { CreateRootUserDto } from '../dtos/create-root-user.dto';
import { UsersCommandsRepository } from '../repositories/users-commands.repository';
import { UsersQueriesRepository } from '../repositories/users-queries.repository';
import { UserAlreadyExistsExeption } from '../exeptions/user-already-exists.exeption';
import { hashPassword } from 'src/shared/utils/passwords.utils';

@Injectable()
export class CreateRootUserUseCase {
  constructor(
    private readonly usersCommandsRepository: UsersCommandsRepository,
    private readonly usersQueriesRepository: UsersQueriesRepository,
  ) {}

  public async execute(data: CreateRootUserDto) {
    const existingUsers = await this.usersQueriesRepository.findManyBy(
      {
        email: data.email,
        username: data.username,
      },
      {
        ensureActive: true,
      },
    );

    if (existingUsers.length > 0) {
      throw new UserAlreadyExistsExeption();
    }

    const passwordHashed = await hashPassword(data.password);

    await this.usersCommandsRepository.save({
      ...data,
      password: passwordHashed,
      isRoot: true,
    });
  }
}
