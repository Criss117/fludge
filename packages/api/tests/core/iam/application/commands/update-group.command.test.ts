import { beforeEach, describe, expect, it } from "bun:test";

import { UpdateGroupCommand } from "@fludge/api/core/iam/application/commands/update-group.command";
import { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import { GroupAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/group-already-exists.exception";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import type { Permission } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";

import { makeAuthContext, makeOwner } from "../../factories";
import { InMemoryGroupRepository } from "../../infrastructure/in-memory-group.repository";
import { InMemoryGroupUniquenessValidator } from "../../infrastructure/in-memory-group-uniqueness-validator";

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

describe("UpdateGroupCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let uniquenessValidator: InMemoryGroupUniquenessValidator;
  let command: UpdateGroupCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    uniquenessValidator = new InMemoryGroupUniquenessValidator();
    command = new UpdateGroupCommand(uniquenessValidator, groupRepository);
  });

  describe("happy path", () => {
    it("updates name, slug, description, permissions and status", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      const result = await command.execute(auth, {
        id: group.id.toString(),
        name: "Equipo Soporte",
        description: "Equipo de soporte tecnico al cliente",
        permissions: ["groups:create", "groups:update", "groups:delete"] as Permission[],
        status: "inactive",
      });

      expect(result).toMatchObject({
        id: group.id.toString(),
        name: "Equipo Soporte",
        slug: "equipo-soporte",
        description: "Equipo de soporte tecnico al cliente",
        status: "inactive",
      });
      expect(result.permissions).toEqual(
        expect.arrayContaining(["groups:create", "groups:update", "groups:delete"]),
      );

      const [stored] = await groupRepository.findById(
        org.id.toString(),
        group.id.toString(),
      );

      expect(stored!.values.name).toBe("Equipo Soporte");
      expect(stored!.values.slug).toBe("equipo-soporte");
      expect(stored!.values.status).toBe("inactive");
    });

    it("supports partial updates without a name", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      const result = await command.execute(auth, {
        id: group.id.toString(),
        description: "Equipo enfocado en clientes de la region norte",
        status: "active",
      });

      expect(result.name).toBe("Equipo Ventas");
      expect(result.status).toBe("active");
      expect(result.description).toBe(
        "Equipo enfocado en clientes de la region norte",
      );
    });
  });

  describe("error cases", () => {
    it("throws GroupNotFoundException when the group is missing", async () => {
      const org = setupOrganization();
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      const err = await command
        .execute(auth, {
          id: UUID.generate().toString(),
          name: "Equipo Soporte",
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(GroupNotFoundException);
      expect(err.message).toBe("api_errors.iam.groups.not_found");
    });

    it("throws GroupAlreadyExistsException when the new name is taken", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      uniquenessValidator.markTaken({ name: "Equipo Soporte" });

      const err = await command
        .execute(auth, {
          id: group.id.toString(),
          name: "Equipo Soporte",
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(GroupAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.groups.name_taken");

      const [stored] = await groupRepository.findById(
        org.id.toString(),
        group.id.toString(),
      );

      expect(stored!.values.name).toBe("Equipo Ventas");
    });

    it("throws GroupAlreadyExistsException when the new slug is taken", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      uniquenessValidator.markTaken({ slug: "equipo-soporte" });

      const err = await command
        .execute(auth, {
          id: group.id.toString(),
          name: "Equipo Soporte",
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(GroupAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.groups.name_taken");
    });

    it("does not check uniqueness when the name is unchanged", async () => {
      const org = setupOrganization();
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });

      await groupRepository.save(group);

      // Even though the current name is marked as taken, keeping the same name
      // must skip the uniqueness check and succeed.
      uniquenessValidator.markTaken({ name: "Equipo Ventas" });

      const result = await command.execute(auth, {
        id: group.id.toString(),
        name: "Equipo Ventas",
        description: "Equipo de ventas renovado para el nuevo periodo",
      });

      expect(result.name).toBe("Equipo Ventas");
      expect(result.description).toBe(
        "Equipo de ventas renovado para el nuevo periodo",
      );
    });
  });
});