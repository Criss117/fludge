import { describe, expect, it, mock } from "bun:test";
import { AddMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";

type SaveReturnType = ReturnType<PgOrganizationRepository["save"]>;

function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) {
  return { save: mock((): SaveReturnType => Promise.resolve(saveResult)) };
}

function makeActiveOrganization() {
  const loggedUserId = UUID.fromString("root-user-1");
  const activeOrganization = Organization.create({
    name: "Acme Corporation",
    legalName: "Acme Corporation",
    taxId: "TAX-1",
    address: "Main Street",
    phone: "555-0100",
    owner: { userId: loggedUserId, role: "owner", assignedBy: null },
  });
  return { activeOrganization, loggedUserId };
}

describe("AddMemberCommand", () => {
  it("adds a member assigned by the logged member and saves only members", async () => {
    const repository = makeRepository();
    const command = new AddMemberCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    const result = await command.execute(loggedUserId.toString(), activeOrganization, {
      userId: "new-user-1",
    });

    expect(result.members).toHaveLength(2);
    expect(result.members[1]).toMatchObject({
      userId: "new-user-1",
      role: "member",
      assignedBy: activeOrganization.members.owner!.id.toString(),
    });
    expect(repository.save).toHaveBeenCalledWith(activeOrganization, {
      onlySave: ["members"],
    });
  });

  it("throws INTERNAL_SERVER_ERROR when saving fails", async () => {
    const repository = makeRepository(err(new Error("boom")));
    const command = new AddMemberCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    await expect(command.execute(loggedUserId.toString(), activeOrganization, {
      userId: "new-user-2",
    })).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
