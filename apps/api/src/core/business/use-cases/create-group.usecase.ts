import { Injectable } from '@nestjs/common';
import { GroupsCommandsRepository } from '../repositories/groups-commands.repository';
import { CreateGroupDto } from '../dtos/create-group.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(
    private readonly groupsCommandsRepository: GroupsCommandsRepository,
  ) {}

  public async execute(businessId: string, data: CreateGroupDto) {
    await this.groupsCommandsRepository.save({
      ...data,
      businessId,
    });
  }
}
