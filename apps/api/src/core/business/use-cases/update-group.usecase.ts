import { Injectable } from '@nestjs/common';
import { GroupsQueriesRepository } from '../repositories/groups-queries.repository';
import { UpdateGroupDto } from '../dtos/update-group.dto';
import { GroupAlreadyExistsException } from '../exceptions/group-already-exists.exception';
import { GroupsCommandsRepository } from '../repositories/groups-commands.repository';
import { GroupSummary } from '@repo/core/entities/group';

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    private readonly groupsQueriesRepository: GroupsQueriesRepository,
    private readonly groupsCommandsRepository: GroupsCommandsRepository,
  ) {}

  public async execute(
    businessId: string,
    groupId: string,
    data: UpdateGroupDto,
  ) {
    if (!data.name && !data.description && !data.permissions) {
      return;
    }

    const existingGroupsInBusiness =
      await this.groupsQueriesRepository.findManyBy({
        businessId,
      });

    const currentGroup = existingGroupsInBusiness.find(
      (group) => group.id === groupId,
    );

    if (!currentGroup) {
      throw new GroupAlreadyExistsException();
    }

    if (
      data.name === currentGroup.name &&
      data.description === currentGroup.description &&
      data.permissions === currentGroup.permissions
    ) {
      return;
    }

    const groupsInBusiness: GroupSummary[] = existingGroupsInBusiness.filter(
      (group) => group.id !== groupId,
    );

    const nameIsOccupied = groupsInBusiness.some(
      (group) => group.name === data.name,
    );

    if (nameIsOccupied) {
      throw new GroupAlreadyExistsException(
        'El nombre de grupo ya esta ocupado',
      );
    }

    await this.groupsCommandsRepository.save({
      id: groupId,
      businessId,
      name: data.name ?? currentGroup.name,
      description: data.description ?? currentGroup.description,
      permissions: data.permissions ?? currentGroup.permissions,
      updatedAt: new Date(),
    });
  }
}
