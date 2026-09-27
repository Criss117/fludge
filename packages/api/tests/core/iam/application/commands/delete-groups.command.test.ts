import { beforeEach, describe, expect, it } from "bun:test";

import { DeleteGroupsCommand } from "@fludge/api/core/iam/application/commands/delete-groups.command";
import { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";

import { makeAuthContext, makeOwner } from "../../factories";
import { InMemoryGroupRepository } from "../../infrastructure/in-memory-group.repository";

function setupOrganization() {
  return Organization.create({
    name: "Acme Corp",
    legalName: "Acme Corporation S.A.",
    taxId: "30-71234567-8",
    address: "Av. Siempre Viva 742",
    phone: "5491155551234",
  });
}

function setupGroup(organizationId: UUID, name: string) {
  return Group.create({
    name,
    description: "Equipo de ventas de la region norte",
    permissions: Permissions.fromList(["groups:read"]),
    createdBy: UUID.generate(),
    organizationId,
  });
}

describe("DeleteGroupsCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let command: DeleteGroupsCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    command = new DeleteGroupsCommand(groupRepository);
  });

  describe("happy path", () => {
    it("deletes multiple groups from the repository", async () => {
      const org = setupOrganization();
      const groupOne = setupGroup(org.id, "Equipo Ventas");
      const groupTwo = setupGroup(org.id, "Equipo Soporte");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save([groupOne, groupTwo]);

      const result = await command.execute(auth, {
        groupIds: [groupOne.id.toString(), groupTwo.id.toString()],
      });

      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(
        expect.arrayContaining([groupOne.id.toString(), groupTwo.id.toString()]),
      );
      expect(groupRepository.size).toBe(0);

      const [storedOne] = await groupRepository.findById(
        org.id.toString(),
        groupOne.id.toString(),
      );
      const [storedTwo] = await groupRepository.findById(
        org.id.toString(),
        groupTwo.id.toString(),
      );

      expect(storedOne).toBeNull();
      expect(storedTwo).toBeNull();
    });

    it("keeps non-targeted groups intact", async () => {
      const org = setupOrganization();
      const groupOne = setupGroup(org.id, "Equipo Ventas");
      const groupTwo = setupGroup(org.id, "Equipo Soporte");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save([groupOne, groupTwo]);

      await command.execute(auth, { groupIds: [groupOne.id.toString()] });

      expect(groupRepository.size).toBe(1);

      const [storedTwo] = await groupRepository.findById(
        org.id.toString(),
        groupTwo.id.toString(),
      );

      expect(storedTwo).not.toBeNull();
    });
  });

  describe("error cases", () => {
    it("throws InternalServerError when some groups are not found", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          groupIds: [group.id.toString(), UUID.generate().toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(InternalServerError);
      expect(err.message).toBe("api_errors.iam.groups.isr_on_find");
    });

    it("does not delete anything when validation fails", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      await command
        .execute(auth, {
          groupIds: [group.id.toString(), UUID.generate().toString()],
        })
        .catch(() => undefined);

      expect(groupRepository.size).toBe(1);
    });
  });
});