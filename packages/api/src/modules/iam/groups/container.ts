import { dbConnection } from "@fludge/db";

import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { CreateGroupCommand } from "./application/commands/create-group.command";
import { PGGroupsCommandsRepository } from "./infrastructure/repositories/pg-groups-commands.repository";
import { FindAllGroupsByMemberQuery } from "./application/queries/find-all-groups-by-member.query";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { DeleteGroupsCommand } from "./application/commands/delete-groups.command";
import { FindAllGroupsQuery } from "./application/queries/find-all-groups.query";

// Repositories
const groupsCommandsRepository = new PGGroupsCommandsRepository(dbConnection);

// Commands
const createGroupCommand = new CreateGroupCommand(
  eventBus,
  groupsCommandsRepository,
);
const updateGroupCommand = new UpdateGroupCommand(groupsCommandsRepository);
const deleteGroupCommand = new DeleteGroupsCommand(groupsCommandsRepository);

// Queries
const findAllGroupsByMemberQuery = new FindAllGroupsByMemberQuery(dbConnection);
const findAllGroupsQuery = new FindAllGroupsQuery(dbConnection);

export const groupsContainer = {
  commands: {
    create: createGroupCommand,
    update: updateGroupCommand,
    delete: deleteGroupCommand,
  },
  queries: {
    findAllByMember: findAllGroupsByMemberQuery,
    findAll: findAllGroupsQuery,
  },
} as const;
