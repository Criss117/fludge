import { beforeEach, describe, expect, it } from "bun:test";

import { RegisterOrganizationCommand } from "@fludge/api/core/iam/application/commands/register-organization.command";
import { OrganizationAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/organization-already-exists.exception";
import { PERMISSIONS } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";

import { InMemoryGroupRepository } from "../../infrastructure/in-memory-group.repository";
import { InMemoryMemberRepository } from "../../infrastructure/in-memory-member.repository";
import { InMemoryOrganizationRepository } from "../../infrastructure/in-memory-organization.repository";
import { InMemoryOrganizationUniquenessValidator } from "../../infrastructure/in-memory-organization-uniqueness-validator";

const ROOT_USER_ID = "0192d840-7c3f-73b2-8f71-2c1b6a9e5d01";

const VALID_CMD = {
  name: "Acme Corp",
  legalName: "Acme Corporation S.A.",
  taxId: "30-71234567-8",
  address: "Av. Siempre Viva 742",
  phone: "5491155551234",
};

const ADMIN_GROUP_PERMISSIONS = Permissions.fromRecord(PERMISSIONS).values;

describe("RegisterOrganizationCommand", () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let memberRepository: InMemoryMemberRepository;
  let groupRepository: InMemoryGroupRepository;
  let uniquenessValidator: InMemoryOrganizationUniquenessValidator;
  let command: RegisterOrganizationCommand;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    memberRepository = new InMemoryMemberRepository();
    groupRepository = new InMemoryGroupRepository();
    uniquenessValidator = new InMemoryOrganizationUniquenessValidator();
    command = new RegisterOrganizationCommand(
      uniquenessValidator,
      organizationRepository,
      memberRepository,
      groupRepository,
    );
  });

  describe("happy path", () => {
    it("creates and persists the organization", async () => {
      const result = await command.execute(ROOT_USER_ID, VALID_CMD);
      const [stored] = await organizationRepository.findById(
        result.organization.id,
      );

      expect(stored).not.toBeNull();
      expect(stored!.values).toMatchObject({
        id: result.organization.id,
        name: VALID_CMD.name,
        slug: "acme-corp",
        legalName: VALID_CMD.legalName,
        taxId: VALID_CMD.taxId,
        address: VALID_CMD.address,
        phone: VALID_CMD.phone,
        status: "active",
      });
    });

    it("creates an owner member for the root user tied to the organization", async () => {
      const result = await command.execute(ROOT_USER_ID, VALID_CMD);
      const [stored] = await memberRepository.findById(
        result.organization.id,
        result.member.id,
      );

      expect(stored).not.toBeNull();
      expect(stored!.values).toMatchObject({
        id: result.member.id,
        userId: ROOT_USER_ID,
        organizationId: result.organization.id,
        role: "owner",
        assignedBy: null,
        status: "active",
      });
    });

    it("creates and persists the Administradores admin group with all permissions", async () => {
      const result = await command.execute(ROOT_USER_ID, VALID_CMD);
      const [stored] = await groupRepository.findById(
        result.organization.id,
        result.group.id,
      );

      expect(stored).not.toBeNull();
      expect(stored!.values).toMatchObject({
        id: result.group.id,
        name: "Administradores",
        slug: "administradores",
        organizationId: result.organization.id,
        createdBy: result.member.id,
        status: "active",
      });
      expect(stored!.permissions.values).toEqual(ADMIN_GROUP_PERMISSIONS);
    });

    it("returns organization, member and group values", async () => {
      const result = await command.execute(ROOT_USER_ID, VALID_CMD);

      expect(result.organization).toMatchObject({
        id: expect.any(String),
        name: VALID_CMD.name,
        status: "active",
      });
      expect(result.member).toMatchObject({
        userId: ROOT_USER_ID,
        role: "owner",
      });
      expect(result.group).toMatchObject({
        name: "Administradores",
        permissions: ADMIN_GROUP_PERMISSIONS,
      });
    });
  });

  describe("uniqueness validation", () => {
    it("throws OrganizationAlreadyExistsException when the name is taken", async () => {
      uniquenessValidator.markTaken({ name: VALID_CMD.name });

      const err = await command.execute(ROOT_USER_ID, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.name_taken");
    });

    it("throws OrganizationAlreadyExistsException when the slug is taken", async () => {
      uniquenessValidator.markTaken({ slug: "acme-corp" });

      const err = await command.execute(ROOT_USER_ID, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.name_taken");
    });

    it("throws OrganizationAlreadyExistsException when the legal name is taken", async () => {
      uniquenessValidator.markTaken({ legalName: VALID_CMD.legalName });

      const err = await command.execute(ROOT_USER_ID, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe(
        "api_errors.iam.organizations.legal_name_taken",
      );
    });

    it("throws OrganizationAlreadyExistsException when the tax id is taken", async () => {
      uniquenessValidator.markTaken({ taxId: VALID_CMD.taxId });

      const err = await command.execute(ROOT_USER_ID, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.tax_id_taken");
    });

    it("throws OrganizationAlreadyExistsException when the phone is taken", async () => {
      uniquenessValidator.markTaken({ phone: VALID_CMD.phone });

      const err = await command.execute(ROOT_USER_ID, VALID_CMD).catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.phone_taken");
    });

    it("persists nothing when uniqueness validation fails", async () => {
      uniquenessValidator.markTaken({ name: VALID_CMD.name });

      await expect(command.execute(ROOT_USER_ID, VALID_CMD)).rejects.toBeInstanceOf(
        OrganizationAlreadyExistsException,
      );

      expect(organizationRepository.size).toBe(0);
      expect(memberRepository.size).toBe(0);
      expect(groupRepository.size).toBe(0);
    });
  });
});