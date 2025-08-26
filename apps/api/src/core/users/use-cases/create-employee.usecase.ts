import { Injectable } from '@nestjs/common';
import { UsersQueriesRepository } from '../repositories/users-queries.repository';
import { UsersCommandsRepository } from '../repositories/users-commands.repository';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UserAlreadyExistsExeption } from '../exeptions/user-already-exists.exeption';
import { hashPassword } from 'src/shared/utils/passwords.utils';
import type { TX } from '@core/db/db.module';

type Options = {
  tx: TX;
};

@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    private readonly usersQueriesRepository: UsersQueriesRepository,
    private readonly usersCommandsRepository: UsersCommandsRepository,
  ) {}

  public async execute(data: CreateEmployeeDto, options?: Options) {
    const existingUsers = await this.usersQueriesRepository.findManyBy({
      username: data.username,
    });

    if (existingUsers.length > 0) {
      throw new UserAlreadyExistsExeption();
    }

    const hashedPassword = await hashPassword(data.password);

    return this.usersCommandsRepository.save(
      {
        ...data,
        password: hashedPassword,
        isRoot: false,
      },
      options,
    );
  }
}
