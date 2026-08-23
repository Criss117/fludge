import { describe, expect, it, mock } from "bun:test";

const fakeDatabaseService = { marker: "organization-test-database" };

mock.module("@fludge/db", () => ({
  databaseService: fakeDatabaseService,
  buildConflictUpdateColumn: () => ({}),
  jsonObject: () => ({}),
}));

const [{ organizationContainer }, { PgOrganizationRepository }, { OrganizationUniquenessValidator }, { EnsureOrganizationExistsService }, { FindAllOrganizationsQuery }, { RegisterOrganizationCommand }, { UpdateOrganizationCommand }, { CreateGroupCommand }, { UpdateGroupCommand }, { AddMemberCommand }, { AssignMembersToGroupCommand }, { AssignGroupsToMemberCommand }] = await Promise.all([
  import("@fludge/api/modules/iam/organization/container"),
  import("@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository"),
  import("@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service"),
  import("@fludge/api/modules/iam/organization/application/services/ensure-organization-exists.service"),
  import("@fludge/api/modules/iam/organization/application/queries/find-all-organizations.query"),
  import("@fludge/api/modules/iam/organization/application/commands/register-organization.commad"),
  import("@fludge/api/modules/iam/organization/application/commands/update-organization.command"),
  import("@fludge/api/modules/iam/organization/application/commands/create-group.command"),
  import("@fludge/api/modules/iam/organization/application/commands/update-group.command"),
  import("@fludge/api/modules/iam/organization/application/commands/add-member.command"),
  import("@fludge/api/modules/iam/organization/application/commands/assign-members-to-group.command"),
  import("@fludge/api/modules/iam/organization/application/commands/assign-groups-to-member.command"),
]);

describe("organizationContainer", () => {
  it("wires every organization collaborator to its concrete class", () => {
    expect(organizationContainer.repositories.organizationRepository).toBeInstanceOf(PgOrganizationRepository);
    expect(organizationContainer.services.organizationUniquenessValidator).toBeInstanceOf(OrganizationUniquenessValidator);
    expect(organizationContainer.services.ensureOrganizationExistsService).toBeInstanceOf(EnsureOrganizationExistsService);
    expect(organizationContainer.commands.register).toBeInstanceOf(RegisterOrganizationCommand);
    expect(organizationContainer.commands.update).toBeInstanceOf(UpdateOrganizationCommand);
    expect(organizationContainer.commands.group.create).toBeInstanceOf(CreateGroupCommand);
    expect(organizationContainer.commands.group.update).toBeInstanceOf(UpdateGroupCommand);
    expect(organizationContainer.commands.group.assignMembers).toBeInstanceOf(AssignMembersToGroupCommand);
    expect(organizationContainer.commands.member.add).toBeInstanceOf(AddMemberCommand);
    expect(organizationContainer.commands.member.assignGroups).toBeInstanceOf(AssignGroupsToMemberCommand);
    expect(organizationContainer.queries.findAll).toBeInstanceOf(FindAllOrganizationsQuery);
  });

  it("shares the mocked database service across database-backed collaborators", () => {
    const repositoryDb = (organizationContainer.repositories.organizationRepository as any).db;
    const validatorDb = (organizationContainer.services.organizationUniquenessValidator as any).db;
    const ensureDb = (organizationContainer.services.ensureOrganizationExistsService as any).db;
    const queryDb = (organizationContainer.queries.findAll as any).db;

    expect(repositoryDb).toBe(fakeDatabaseService);
    expect(validatorDb).toBe(repositoryDb);
    expect(ensureDb).toBe(repositoryDb);
    expect(queryDb).toBe(repositoryDb);
  });
});
