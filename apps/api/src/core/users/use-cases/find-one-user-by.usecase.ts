import { Injectable } from '@nestjs/common';
import { UsersQueriesRepository } from '../repositories/users-queries.repository';
import { FindManyUsersByDto } from '../repositories/dtos/find-many-users-by.dto';
import { UserNotFoundExeption } from '../exeptions/user-not-found.exeption';

@Injectable()
export class FindOneUserByUseCase {
  constructor(
    private readonly usersQueriesRepository: UsersQueriesRepository,
  ) {}

  public async execute(meta: FindManyUsersByDto) {
    const user = await this.usersQueriesRepository.findOneBy(meta, {
      ensureActive: true,
    });

    if (!user) {
      throw new UserNotFoundExeption();
    }

    return user;
  }
}
