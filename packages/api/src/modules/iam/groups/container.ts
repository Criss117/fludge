import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";
import { CreateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import { PGGroupsCommandsRepository } from "./infrastructure/repositories/pg-groups-commands.repository";
import { dbConnection } from "@fludge/db";

const groupsCommandsRepository = new PGGroupsCommandsRepository(dbConnection);

const createGroupCommand = new CreateGroupCommand(
  eventBus,
  groupsCommandsRepository,
);

export const groupsContainer = {
  commands: {
    createGroup: createGroupCommand,
  },
  queries: {},
} as const;
