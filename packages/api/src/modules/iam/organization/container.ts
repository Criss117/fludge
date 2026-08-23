import { databaseService } from "@fludge/db";

import { RegisterOrganizationCommand } from "./application/commands/register-organization.commad";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { PgOrganizationRepository } from "./infrastructure/repositories/pg-organization.repository";
import { FindAllOrganizationsQuery } from "./application/queries/find-all-organizations.query";
import { EnsureOrganizationExistsService } from "./application/services/ensure-organization-exists.service";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";

//Repositories
const organizationRepository = new PgOrganizationRepository(databaseService);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);
const ensureOrganizationExistsService = new EnsureOrganizationExistsService(
  databaseService,
);

//Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
);
const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationRepository,
  organizationUniquenessValidator,
);

//Queries
const findAllOrganizationsQuery = new FindAllOrganizationsQuery(
  databaseService,
);

export const organizationContainer = {
  repositories: { organizationRepository },
  services: {
    organizationUniquenessValidator,
    ensureOrganizationExistsService,
  },
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
  },
  queries: { findAll: findAllOrganizationsQuery },
};
