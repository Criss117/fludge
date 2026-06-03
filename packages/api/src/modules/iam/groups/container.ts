import { dbConnection } from "@fludge/db";

import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";
import { CreateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";

import { PGGroupsCommandsRepository } from "./infrastructure/repositories/pg-groups-commands.repository";
import { FindAllGroupsByMemberQuery } from "./application/queries/find-all-groups-by-member.query";
import { UpdateGroupCommand } from "./application/commands/update-group.command";

// Repositories
const groupsCommandsRepository = new PGGroupsCommandsRepository(dbConnection);

// Commands
const createGroupCommand = new CreateGroupCommand(
  eventBus,
  groupsCommandsRepository,
);
const updateGroupCommand = new UpdateGroupCommand(groupsCommandsRepository);

// Queries
const findAllGroupsByMemberQuery = new FindAllGroupsByMemberQuery(dbConnection);

export const groupsContainer = {
  commands: {
    create: createGroupCommand,
    update: updateGroupCommand,
  },
  queries: {
    findAllByMember: findAllGroupsByMemberQuery,
  },
} as const;
