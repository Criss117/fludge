import { beforeEach, describe, expect, it } from "bun:test";

import { CreateGroupCommand } from "@fludge/api/core/iam/application/commands/create-group.command";
import { GroupAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/group-already-exists.exception";
import type { Permission } from "@fludge/utils/permissions/data";

import { makeAuthContext, makeOwner } from "../../factories";
import { InMemoryGroupRepository } from "../../infrastructure/in-memory-group.repository";
import { InMemoryGroupUniquenessValidator } from "../../infrastructure/in-memory-group-uniqueness-validator";

const VALID_CMD = {
  name: "Equipo Ventas",
  description: "Equipo de ventas de la region norte",
  permissions: ["groups:read", "members:create"] as Permission[],
};

describe("CreateGroupCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let uniquenessValidator: InMemoryGroupUniquenessValidator;
  let command: CreateGroupCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    uniquenessValidator = new InMemoryGroupUniquenessValidator();
    command = new CreateGroupCommand(uniquenessValidator, groupRepository);
  });

  describe("happy path", () => {
    it("creates and persists the group for the auth organization", async () => {
      const auth = makeAuthContext({ member: makeOwner() });
      const result = await command.execute(auth, VALID_CMD);

      const [stored] = await groupRepository.findById(
        auth.organizationId.toString(),
        result.id,
      );

      expect(stored).not.toBeNull();
      expect(stored!.values).toMatchObject({
        id: result.id,
        name: VALID_CMD.name,
        slug: "equipo-ventas",
        description: VALID_CMD.description,
        organizationId: auth.organizationId.toString(),
        createdBy: auth.member.id.toString(),
        status: "active",
      });
      expect(stored!.permissions.values).toEqual(
        expect.arrayContaining(["groups:read", "members:create"]),
      );
    });

    it("returns the created group values", async () => {
      const auth = makeAuthContext({ member: makeOwner() });
      const result = await command.execute(auth, VALID_CMD);

      expect(result).toMatchObject({
        name: VALID_CMD.name,
        slug: "equipo-ventas",
        description: VALID_CMD.description,
        organizationId: auth.organizationId.toString(),
        createdBy: auth.member.id.toString(),
        status: "active",
      });
    });
  });

  describe("uniqueness validation", () => {
    it("throws GroupAlreadyExistsException when the name is taken", async () => {
      uniquenessValidator.markTaken({ name: VALID_CMD.name });
      const auth = makeAuthContext({ member: makeOwner() });

      const err = await command.execute(auth, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(GroupAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.groups.name_taken");
      expect(groupRepository.size).toBe(0);
    });

    it("throws GroupAlreadyExistsException when the slug is taken", async () => {
      uniquenessValidator.markTaken({ slug: "equipo-ventas" });
      const auth = makeAuthContext({ member: makeOwner() });

      const err = await command.execute(auth, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(GroupAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.groups.name_taken");
      expect(groupRepository.size).toBe(0);
    });
  });
});