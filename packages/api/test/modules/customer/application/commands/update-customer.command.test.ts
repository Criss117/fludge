import { describe, expect, it } from "bun:test";

import { UpdateCustomerCommand } from "@fludge/api/modules/customer/application/commands/update-customer.command";
import { ConflictError, NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";

function setup() {
  const repository = new InMemoryCustomerRepository();
  const command = new UpdateCustomerCommand(repository);

  return { repository, command };
}

function seedCustomer(
  repository: InMemoryCustomerRepository,
  orgId: string,
  options?: { documentNumber?: string },
) {
  const customer = buildCustomer({
    organizationId: orgId,
    documentNumber: options?.documentNumber ?? "1234567890",
  });

  repository.save(customer);

  return customer;
}

describe("UpdateCustomerCommand", () => {
  it("updates contact fields", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString());

    const result = await command.execute(org, {
      id: customer.values.id,
      name: "María Gómez",
      phone: "+57 311 000 0000",
    });

    expect(result.name).toBe("María Gómez");
    expect(result.phone).toBe("+57 311 000 0000");
  });

  it("updates credit limit and status", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString());

    const result = await command.execute(org, {
      id: customer.values.id,
      creditLimit: 1000000,
      status: "inactive",
    });

    expect(result.creditLimit).toBe(1000000);
    expect(result.status).toBe("inactive");
  });

  it("updates the document", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString());

    const result = await command.execute(org, {
      id: customer.values.id,
      documentType: "NIT",
      documentNumber: "900123456",
    });

    expect(result.documentType).toBe("NIT");
    expect(result.documentNumber).toBe("900123456");
  });

  it("throws NotFoundError when the customer does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(org, {
        id: "00000000-0000-4000-8000-000000000000",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when the document belongs to another customer", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString(), {
      documentNumber: "1234567890",
    });
    const other = buildCustomer({
      organizationId: org.id.toString(),
      documentNumber: "9999999999",
    });
    await repository.save(other);

    await expect(
      command.execute(org, {
        id: customer.values.id,
        documentNumber: "9999999999",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("allows keeping the same document", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString(), {
      documentNumber: "1234567890",
    });

    const result = await command.execute(org, {
      id: customer.values.id,
      documentNumber: "1234567890",
    });

    expect(result.documentNumber).toBe("1234567890");
  });

  it("persists the updated customer", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const customer = seedCustomer(repository, org.id.toString());

    await command.execute(org, {
      id: customer.values.id,
      name: "Actualizado",
    });

    const persisted = repository.getAll(org.id.toString())[0]!;
    expect(persisted.values.name).toBe("Actualizado");
  });
});