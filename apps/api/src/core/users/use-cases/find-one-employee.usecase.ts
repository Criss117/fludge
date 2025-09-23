import { Injectable } from '@nestjs/common';
import { UsersQueriesRepository } from '../repositories/users-queries.repository';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class FindOneEmployeeUseCase {
  constructor(
    private readonly usersQueriesRepository: UsersQueriesRepository,
  ) {}

  public async execute(businessId: string, userId: string) {
    const user = await this.usersQueriesRepository.findOneEmployee(
      {
        businessId,
        userId,
      },
      {
        ensureActive: true,
      },
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
