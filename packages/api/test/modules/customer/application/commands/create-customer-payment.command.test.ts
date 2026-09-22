import { describe, expect, it } from "bun:test";

import { CreateCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/create-customer-payment.command";
import {
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { InMemoryCustomerPaymentRepository } from "@test/support/repositories/in-memory-customer-payment.repository";
import { InMemorySaleRepository } from "@test/support/repositories/in-memory-sale.repository";
import { PaySaleService } from "@fludge/api/modules/sales/application/services/pay-sale.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";
import { buildSale } from "@test/support/builders/sale.builder";

type Cmd = {
  customerId: string;
  amount: number;
  method: "cash" | "transfer";
  notes?: string | null | undefined;
};

function setup() {
  const customerRepository = new InMemoryCustomerRepository();
  const customerPaymentRepository = new InMemoryCustomerPaymentRepository();
  const saleRepository = new InMemorySaleRepository();
  const paySaleService = new PaySaleService(saleRepository);
  const command = new CreateCustomerPaymentCommand(
    customerRepository,
    customerPaymentRepository,
    saleRepository,
    paySaleService,
  );

  return {
    customerRepository,
    customerPaymentRepository,
    saleRepository,
    paySaleService,
    command,
  };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    customerId: "00000000-0000-4000-8000-000000000003",
    amount: 10000,
    method: "cash",
    notes: null,
    ...overrides,
  };
}

describe("CreateCustomerPaymentCommand", () => {
  it("creates a payment and persists it", async () => {
    const { command, customerRepository, customerPaymentRepository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    await customerRepository.save(customer);

    const result = await command.execute(
      org,
      ownerUserId,
      validCmd({ customerId: customer.id.toString() }),
    );

    expect(result.amount).toBe(10000);
    expect(result.method).toBe("cash");
    expect(result.status).toBe("active");
    expect(result.customerId).toBe(customer.id.toString());
    expect(result.notes).toBeNull();

    const persisted = customerPaymentRepository.getAll(org.id.toString());
    expect(persisted).toHaveLength(1);
    expect(persisted[0]!.values.amount).toBe(10000);

    const [updatedCustomer] = await customerRepository.findById(
      org.id.toString(),
      customer.id.toString(),
    );
    expect(updatedCustomer!.values.balance).toBe(40000);
    expect(updatedCustomer!.payments).toHaveLength(1);
    expect(updatedCustomer!.payments[0]!.amount).toBe(10000);
  });

  it("pays open sales for the customer", async () => {
    const { command, customerRepository, saleRepository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    await customerRepository.save(customer);

    const sale = buildSale({
      paymentType: "credit",
      customerId: customer.id.toString(),
      organizationId: org.id.toString(),
    });
    await saleRepository.save(sale);

    // La venta a crédito nace "open" con remaining = total (2 × 1000).
    // PaySaleService paga cada venta con (amount - remaining): para
    // cubrirla por completo hay que pagar 2 × remaining.
    await command.execute(
      org,
      ownerUserId,
      validCmd({
        customerId: customer.id.toString(),
        amount: sale.remaining * 2,
      }),
    );

    const persisted = saleRepository.getAll(org.id.toString())[0]!;
    expect(persisted.values.status).toBe("completed");
  });

  it("stores the payment in the customer's payment collection", async () => {
    const { command, customerRepository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    await customerRepository.save(customer);

    const result = await command.execute(
      org,
      ownerUserId,
      validCmd({ customerId: customer.id.toString() }),
    );

    const [updatedCustomer] = await customerRepository.findById(
      org.id.toString(),
      customer.id.toString(),
    );

    expect(updatedCustomer!.payments).toHaveLength(1);
    expect(updatedCustomer!.payments[0]!.id.toString()).toBe(result.id);
    expect(updatedCustomer!.payments[0]!.method).toBe("cash");
  });

  it("throws NotFoundError when customer does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    await expect(
      command.execute(
        org,
        ownerUserId,
        validCmd({ customerId: "00000000-0000-4000-8000-000000000099" }),
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws InternalServerError when customer repository fails on find", async () => {
    const { customerPaymentRepository, saleRepository, paySaleService } =
      setup();
    const { org, ownerUserId } = buildOrganization();

    // Simula un fallo de BD inyectando un repo que falla al buscar
    const failingRepository = new InMemoryCustomerRepository();
    failingRepository.findById = async () => {
      return [null, new Error("db down")] as const;
    };

    const failingCommand = new CreateCustomerPaymentCommand(
      failingRepository,
      customerPaymentRepository,
      saleRepository,
      paySaleService,
    );

    await expect(
      failingCommand.execute(org, ownerUserId, validCmd()),
    ).rejects.toThrow(InternalServerError);
  });

  it("throws InternalServerError when payment repository fails on save", async () => {
    const { customerRepository, saleRepository, paySaleService } = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    await customerRepository.save(customer);

    // Simula un fallo de BD inyectando un repo que falla al guardar
    const failingPaymentRepository = new InMemoryCustomerPaymentRepository();
    failingPaymentRepository.save = async () => {
      return [null, new Error("db down")] as const;
    };

    const failingCommand = new CreateCustomerPaymentCommand(
      customerRepository,
      failingPaymentRepository,
      saleRepository,
      paySaleService,
    );

    await expect(
      failingCommand.execute(
        org,
        ownerUserId,
        validCmd({ customerId: customer.id.toString() }),
      ),
    ).rejects.toThrow(InternalServerError);
  });
});
