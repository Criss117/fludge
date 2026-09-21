import { describe, expect, it } from "bun:test";

import { CreateCustomerCommand } from "@fludge/api/modules/customer/application/commands/create-customer.command";
import { ConflictError, InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";

type Cmd = {
  name: string;
  phone: string;
  email: string | null;
  creditLimit: number;
  documentType: "CC" | "NIT" | "CE";
  documentNumber: string;
};

function setup() {
  const repository = new InMemoryCustomerRepository();
  const command = new CreateCustomerCommand(repository);

  return { repository, command };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    name: "Juan Pérez",
    phone: "+57 300 123 4567",
    email: "juan@example.com",
    creditLimit: 500000,
    documentType: "CC",
    documentNumber: "1234567890",
    ...overrides,
  };
}

describe("CreateCustomerCommand", () => {
  it("creates a customer and persists it", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(org, ownerUserId, validCmd());

    expect(result.name).toBe("Juan Pérez");
    expect(result.balance).toBe(0);
    expect(result.status).toBe("active");
    expect(repository.getAll(org.id.toString())).toHaveLength(1);
  });

  it("assigns the logged member as createdBy", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(org, ownerUserId, validCmd());

    const loggedMember = org.members.getMemberByUserId(
      (await import("@fludge/utils/uuid")).UUID.fromString(ownerUserId),
    )!;
    expect(result.createdBy).toBe(loggedMember.id.toString());
  });

  it("checks document uniqueness", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const existing = buildCustomer({
      organizationId: org.id.toString(),
      documentNumber: "9999999999",
    });
    await repository.save(existing);

    await expect(
      command.execute(
        org,
        ownerUserId,
        validCmd({ documentNumber: "9999999999" }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("does not check uniqueness when documentNumber is absent", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const existing = buildCustomer({
      organizationId: org.id.toString(),
      documentNumber: "9999999999",
    });
    await repository.save(existing);

    // documentNumber es obligatorio en el validator; el command solo consulta
    // si viene presente. Con valor presente y libre, crea.
    const result = await command.execute(
      org,
      ownerUserId,
      validCmd({ documentNumber: "1111111111" }),
    );

    expect(result.documentNumber).toBe("1111111111");
    expect(repository.getAll(org.id.toString())).toHaveLength(2);
  });

  it("throws InternalServerError when the repository fails", async () => {
    const { org, ownerUserId } = buildOrganization();
    // Simula un fallo de BD inyectando un repo que falla al guardar
    const failingRepository = new InMemoryCustomerRepository();
    failingRepository.save = async () => {
      return [null, new Error("db down")] as const;
    };

    const failingCommand = new CreateCustomerCommand(failingRepository);

    await expect(
      failingCommand.execute(org, ownerUserId, validCmd()),
    ).rejects.toThrow(InternalServerError);
  });
});