import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GroupsCommandsRepository } from '../repositories/groups-commands.repository';
import { CreateGroupDto } from '../dtos/create-group.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(
    private readonly groupsCommandsRepository: GroupsCommandsRepository,
  ) {}

  public async execute(businessId: string, data: CreateGroupDto) {
    if (data.permissions.includes('businesses:delete')) {
      throw new UnauthorizedException(
        "You can't create a group with this permission",
      );
    }

    await this.groupsCommandsRepository.save({
      ...data,
      businessId,
    });
  }
}
