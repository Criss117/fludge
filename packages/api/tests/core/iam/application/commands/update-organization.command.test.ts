import { beforeEach, describe, expect, it } from "bun:test";

import { UpdateOrganizationCommand } from "@fludge/api/core/iam/application/commands/update-organization.command";
import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import { OrganizationAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/organization-already-exists.exception";
import { OrganizationNotFoundException } from "@fludge/api/core/iam/domain/exceptions/organization-not-found.exception";
import { UUID } from "@fludge/utils/uuid";

import { InMemoryOrganizationRepository } from "../../infrastructure/in-memory-organization.repository";
import { InMemoryOrganizationUniquenessValidator } from "../../infrastructure/in-memory-organization-uniqueness-validator";

function setupOrganization() {
  return Organization.create({
    name: "Acme Corp",
    legalName: "Acme Corporation S.A.",
    taxId: "30-71234567-8",
    address: "Av. Siempre Viva 742",
    phone: "5491155551234",
  });
}

describe("UpdateOrganizationCommand", () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let uniquenessValidator: InMemoryOrganizationUniquenessValidator;
  let command: UpdateOrganizationCommand;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    uniquenessValidator = new InMemoryOrganizationUniquenessValidator();
    command = new UpdateOrganizationCommand(
      uniquenessValidator,
      organizationRepository,
    );
  });

  describe("happy path", () => {
    it("updates name, slug, address and phone", async () => {
      const org = setupOrganization();

      await organizationRepository.save(org);

      const result = await command.execute(org.id.toString(), {
        name: "Acme Renovada",
        address: "Av. Nuevo 100",
        phone: "5491199998888",
      });

      expect(result).toMatchObject({
        id: org.id.toString(),
        name: "Acme Renovada",
        slug: "acme-renovada",
        address: "Av. Nuevo 100",
        phone: "5491199998888",
        taxId: org.values.taxId,
        legalName: org.values.legalName,
      });

      const [stored] = await organizationRepository.findById(org.id.toString());

      expect(stored!.values.name).toBe("Acme Renovada");
      expect(stored!.values.slug).toBe("acme-renovada");
      expect(stored!.values.address).toBe("Av. Nuevo 100");
      expect(stored!.values.phone).toBe("5491199998888");
    });

    it("supports partial updates without a name", async () => {
      const org = setupOrganization();

      await organizationRepository.save(org);

      const result = await command.execute(org.id.toString(), {
        address: "Av. Siempre Viva 1000",
      });

      expect(result.name).toBe(org.values.name);
      expect(result.address).toBe("Av. Siempre Viva 1000");
      expect(result.phone).toBe(org.values.phone);
    });
  });

  describe("error cases", () => {
    it("throws OrganizationNotFoundException when the organization is missing", async () => {
      const err = await command
        .execute(UUID.generate().toString(), { name: "Acme Renovada" })
        .catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationNotFoundException);
      expect(err.message).toBe("api_errors.iam.organizations.not_found");
    });

    it("throws OrganizationAlreadyExistsException when the new name is taken", async () => {
      const org = setupOrganization();

      await organizationRepository.save(org);

      uniquenessValidator.markTaken({ name: "Acme Renovada" });

      const err = await command
        .execute(org.id.toString(), { name: "Acme Renovada" })
        .catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.name_taken");

      const [stored] = await organizationRepository.findById(org.id.toString());

      expect(stored!.values.name).toBe(org.values.name);
    });

    it("throws OrganizationAlreadyExistsException when the new slug is taken", async () => {
      const org = setupOrganization();

      await organizationRepository.save(org);

      uniquenessValidator.markTaken({ slug: "acme-renovada" });

      const err = await command
        .execute(org.id.toString(), { name: "Acme Renovada" })
        .catch((e) => e);

      expect(err).toBeInstanceOf(OrganizationAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.organizations.name_taken");
    });
  });
});