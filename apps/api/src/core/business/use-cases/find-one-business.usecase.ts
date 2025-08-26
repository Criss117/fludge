import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';

@Injectable()
export class FindOneBusinessUseCase {
  constructor(
    private readonly businessQueriesRepository: BusinessQueriesRepository,
  ) {}

  public async execute(id: string, logedUserId: string) {
    const business = await this.businessQueriesRepository.findOne(id);

    const logedUserIsRootOrEmployee =
      business.rootUserId === logedUserId ||
      business.employees.some((e) => e.id === logedUserId);

    if (!logedUserIsRootOrEmployee) {
      throw new UnauthorizedException();
    }

    return business;
  }
}
