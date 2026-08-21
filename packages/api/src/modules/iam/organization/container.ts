import { databaseService } from "@fludge/db";

import { RegisterOrganizationCommand } from "./application/commands/register-organization.commad";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { PgOrganizationRepository } from "./infrastructure/repositories/pg-organization.repository";
import { FindAllOrganizationsQuery } from "./application/queries/find-all-organizations.query";

//Repositories
const organizationRepository = new PgOrganizationRepository(databaseService);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);

//Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
);

//Queries
const findAllOrganizationsQuery = new FindAllOrganizationsQuery(
  databaseService,
);

export const organizationContainer = {
  commands: { register: registerOrganizationCommand },
  queries: { findAll: findAllOrganizationsQuery },
};
