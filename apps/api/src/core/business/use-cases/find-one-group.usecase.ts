import { Injectable } from '@nestjs/common';
import { GroupsQueriesRepository } from '../repositories/groups-queries.repository';

@Injectable()
export class FindOneGroupUseCase {
  constructor(
    private readonly groupsQueriesRepository: GroupsQueriesRepository,
  ) {}

  public async execute(businessId: string, groupId: string) {
    return this.groupsQueriesRepository.findOne({
      businessId,
      id: groupId,
    });
  }
}
