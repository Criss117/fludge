import { describe, expect, it } from "bun:test";

import { CreateCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/create-customer-payment.command";
import {
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { InMemoryCustomerPaymentRepository } from "@test/support/repositories/in-memory-customer-payment.repository";
import { InMemoryCustomerPaymentApplicationRepository } from "@test/support/repositories/in-memory-customer-payment-application.repository";
import { InMemorySaleRepository } from "@test/support/repositories/in-memory-sale.repository";
import { PaySaleService } from "@fludge/api/modules/sales/application/services/pay-sale.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";
import { buildSale, makeAdHocItem } from "@test/support/builders/sale.builder";

type Cmd = {
  customerId: string;
  amount: number;
  method: "cash" | "transfer";
  notes?: string | null | undefined;
};

function setup() {
  const customerRepository = new InMemoryCustomerRepository();
  const customerPaymentRepository = new InMemoryCustomerPaymentRepository();
  const customerPaymentApplicationRepository =
    new InMemoryCustomerPaymentApplicationRepository();
  const saleRepository = new InMemorySaleRepository();
  const paySaleService = new PaySaleService(saleRepository);
  const command = new CreateCustomerPaymentCommand(
    customerRepository,
    customerPaymentRepository,
    saleRepository,
    paySaleService,
    customerPaymentApplicationRepository,
  );

  return {
    customerRepository,
    customerPaymentRepository,
    customerPaymentApplicationRepository,
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
    const { command, customerRepository, customerPaymentRepository, customerPaymentApplicationRepository } =
      setup();
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

    // Sin ventas abiertas no deben crearse aplicaciones
    expect(customerPaymentApplicationRepository.getAll()).toHaveLength(0);
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
    // Un solo pago por el remaining completo debe completarla.
    await command.execute(
      org,
      ownerUserId,
      validCmd({
        customerId: customer.id.toString(),
        amount: sale.remaining,
      }),
    );

    const persisted = saleRepository.getAll(org.id.toString())[0]!;
    expect(persisted.values.status).toBe("completed");
  });

  it("applies exactly the payment amount when it is less than the sale remaining", async () => {
    const { command, customerRepository, saleRepository, customerPaymentApplicationRepository } =
      setup();
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

    // El pago no alcanza para cubrir la venta: la sale debe recibir
    // exactamente el monto pagado (nunca un valor negativo) y quedar abierta.
    const paymentAmount = sale.remaining - 1000;

    const result = await command.execute(
      org,
      ownerUserId,
      validCmd({
        customerId: customer.id.toString(),
        amount: paymentAmount,
      }),
    );

    const [saved] = await saleRepository.findById(
      org.id.toString(),
      sale.id.toString(),
    );
    expect(saved!.values.totalPaid).toBe(paymentAmount);
    expect(saved!.values.status).toBe("open");

    const applications = customerPaymentApplicationRepository.getAll();
    expect(applications).toHaveLength(1);
    expect(applications[0]!.values.amount).toBe(paymentAmount);
    expect(applications[0]!.values.paymentId).toBe(result.id);
    expect(applications[0]!.values.saleId).toBe(sale.id.toString());
  });

  it("records a payment application for each sale that received money", async () => {
    const { command, customerRepository, saleRepository, customerPaymentApplicationRepository } =
      setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    await customerRepository.save(customer);

    const smallSale = buildSale({
      paymentType: "credit",
      customerId: customer.id.toString(),
      organizationId: org.id.toString(),
      sequence: 1,
    });
    await saleRepository.save(smallSale);

    const largeSale = buildSale({
      paymentType: "credit",
      customerId: customer.id.toString(),
      organizationId: org.id.toString(),
      sequence: 2,
      items: [makeAdHocItem({ unitPrice: 5000 })],
    });
    await saleRepository.save(largeSale);

    // smallSale remaining 2000, largeSale remaining 5000. Con 3000,
    // la primera sale se paga completa y la segunda recibe el resto.
    const result = await command.execute(
      org,
      ownerUserId,
      validCmd({
        customerId: customer.id.toString(),
        amount: 3000,
      }),
    );

    const applications = customerPaymentApplicationRepository.getAll();
    expect(applications).toHaveLength(2);

    const amounts = applications.map((a) => a.values.amount).sort((a, b) => a - b);
    expect(amounts).toEqual([1000, 2000]);

    const saleIds = applications.map((a) => a.values.saleId).sort();
    expect(saleIds).toEqual(
      [smallSale.id.toString(), largeSale.id.toString()].sort(),
    );

    for (const application of applications) {
      expect(application.values.paymentId).toBe(result.id);
    }
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
      new InMemoryCustomerPaymentApplicationRepository(),
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
      new InMemoryCustomerPaymentApplicationRepository(),
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
