import { Injectable } from '@nestjs/common';
import { UsersQueriesRepository } from '../repositories/users-queries.repository';
import { UsersCommandsRepository } from '../repositories/users-commands.repository';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { hashPassword } from 'src/shared/utils/passwords.utils';
import type { TX } from '@core/db/db.module';

type Options = {
  tx: TX;
};

@Injectable()
export class CreateEmployeeUserUseCase {
  constructor(
    private readonly usersQueriesRepository: UsersQueriesRepository,
    private readonly usersCommandsRepository: UsersCommandsRepository,
  ) {}

  public async execute(data: CreateEmployeeDto, options?: Options) {
    const existingUsers = await this.usersQueriesRepository.findManyBy(
      {
        username: data.username,
      },
      {
        ensureActive: true,
      },
    );

    if (existingUsers.length > 0) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await hashPassword(data.password);

    return this.usersCommandsRepository.save(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: hashedPassword,
        isRoot: false,
      },
      options,
    );
  }
}
