import { Injectable } from '@nestjs/common';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';

@Injectable()
export class FindUserIsInUseCase {
  constructor(
    private readonly businessQueriesRepository: BusinessQueriesRepository,
  ) {}

  public async execute(userId: string) {
    return this.businessQueriesRepository.findUserIsIn(userId, {
      ensureActive: true,
    });
  }
}
