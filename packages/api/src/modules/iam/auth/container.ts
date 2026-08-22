import { databaseService } from "@fludge/db";
import { SetActiveOrganizationCommand } from "./application/commands/set-active-organization.command";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";

const setActiveOrganizationCommand = new SetActiveOrganizationCommand(
  organizationContainer.services.ensureOrganizationExistsService,
  databaseService,
);

export const authContainer = {
  commands: { setActiveOrganization: setActiveOrganizationCommand },
};
