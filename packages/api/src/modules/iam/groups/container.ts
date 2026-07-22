import { dbConnection } from "@fludge/db";

import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { CreateGroupCommand } from "./application/commands/create-group.command";
import { PGGroupRepository } from "./infrastructure/repositories/pg-group.repository";
import { FindAllGroupsByMemberQuery } from "./application/queries/find-all-groups-by-member.query";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { DeleteGroupsCommand } from "./application/commands/delete-groups.command";
import { FindAllGroupsQuery } from "./application/queries/find-all-groups.query";
import { FindGroupHistoryQuery } from "./application/queries/find-group-history.query";
import { PGGroupHistoryRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-group-history.respository";
import { GroupsChecksService } from "@fludge/api/modules/iam/groups/application/services/groups-checks.service";

// Repositories
const groupRepository = new PGGroupRepository(dbConnection);
const groupHistoryRepository = new PGGroupHistoryRepository(dbConnection);

// Services
const groupsChecksService = new GroupsChecksService(dbConnection);

// Commands
const createGroupCommand = new CreateGroupCommand(
  eventBus,
  groupRepository,
  groupsChecksService,
);
const updateGroupCommand = new UpdateGroupCommand(
  groupRepository,
  groupHistoryRepository,
  groupsChecksService,
);
const deleteGroupCommand = new DeleteGroupsCommand(groupRepository);

// Queries
const findAllGroupsByMemberQuery = new FindAllGroupsByMemberQuery(dbConnection);
const findAllGroupsQuery = new FindAllGroupsQuery(dbConnection);
const findGroupHistoryQuery = new FindGroupHistoryQuery(dbConnection);

export const groupsContainer = {
  commands: {
    create: createGroupCommand,
    update: updateGroupCommand,
    delete: deleteGroupCommand,
  },
  queries: {
    findAllByMember: findAllGroupsByMemberQuery,
    findAll: findAllGroupsQuery,
    findHistory: findGroupHistoryQuery,
  },
} as const;
