import { Injectable } from '@nestjs/common';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';
import { UserCanNotAccessException } from '../exceptions/user-cannot-access.exception';
import type { BusinessDetail } from '@repo/core/entities/business';

@Injectable()
export class FindOneBusinessUseCase {
  constructor(
    private readonly businessQueriesRepository: BusinessQueriesRepository,
  ) {}

  public async execute(
    id: string,
    logedUserId: string,
  ): Promise<BusinessDetail> {
    const business = await this.businessQueriesRepository.findOne(id, {
      ensureActive: true,
    });

    const logedUserIsRootOrEmployee =
      business.rootUserId === logedUserId ||
      business.employees.some((e) => e.id === logedUserId);

    if (!logedUserIsRootOrEmployee) {
      throw new UserCanNotAccessException();
    }

    if (business.rootUserId === logedUserId) {
      return business;
    }

    return {
      ...business,
      employees: business.employees.filter((e) => e.id === logedUserId),
    };
  }
}
