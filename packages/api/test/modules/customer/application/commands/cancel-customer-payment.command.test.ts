import { describe, expect, it } from "bun:test";

import { CancelCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/cancel-customer-payment.command";
import { CustomerPaymentApplication } from "@fludge/api/modules/customer/domain/entities/customer-payment-application.entity";
import { PaymentAlreadyCancelledException } from "@fludge/api/modules/customer/domain/exceptions/payment-already-cancelled.exception";
import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { InMemoryCustomerPaymentRepository } from "@test/support/repositories/in-memory-customer-payment.repository";
import { InMemoryCustomerPaymentApplicationRepository } from "@test/support/repositories/in-memory-customer-payment-application.repository";
import { InMemorySaleRepository } from "@test/support/repositories/in-memory-sale.repository";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";
import { buildSale } from "@test/support/builders/sale.builder";
import { UUID } from "@fludge/utils/uuid";

type Cmd = {
  paymentId: string;
  reason: string;
};

function setup() {
  const customerRepository = new InMemoryCustomerRepository();
  const customerPaymentRepository = new InMemoryCustomerPaymentRepository();
  const customerPaymentApplicationRepository =
    new InMemoryCustomerPaymentApplicationRepository();
  const saleRepository = new InMemorySaleRepository();
  const command = new CancelCustomerPaymentCommand(
    customerRepository,
    customerPaymentRepository,
    customerPaymentApplicationRepository,
    saleRepository,
  );

  return {
    customerRepository,
    customerPaymentRepository,
    customerPaymentApplicationRepository,
    saleRepository,
    command,
  };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    paymentId: "00000000-0000-4000-8000-000000000099",
    reason: "Pago duplicado",
    ...overrides,
  };
}

/**
 * Crea un cliente con saldo, registra un pago que se aplica a una venta a
 * crédito y persiste cliente, pago, venta y aplicación. Devuelve los repos y
 * un comando unidos a los mismos stores.
 */
async function buildPaidPayment(options?: {
  paymentAmount?: number;
  saleAmount?: number;
  organizationId?: string;
}) {
  const repos = setup();
  const { org, ownerUserId } = buildOrganization();
  const organizationId = options?.organizationId ?? org.id.toString();
  const paymentAmount = options?.paymentAmount ?? 1000;
  const saleAmount = options?.saleAmount ?? paymentAmount;

  const customer = buildCustomer({
    organizationId,
    balance: 50000,
  });
  const payment = customer.recordPayment(
    paymentAmount,
    "cash",
    null,
    UUID.fromString(ownerUserId),
  );
  await repos.customerRepository.save(customer);
  await repos.customerPaymentRepository.save(payment);

  const sale = buildSale({
    paymentType: "credit",
    customerId: customer.id.toString(),
    organizationId,
  });
  sale.pay(saleAmount);
  await repos.saleRepository.save(sale);

  const application = CustomerPaymentApplication.create({
    paymentId: payment.id,
    saleId: sale.id,
    amount: saleAmount,
  });
  await repos.customerPaymentApplicationRepository.save(application);

  return {
    org,
    ownerUserId,
    organizationId,
    customer,
    payment,
    sale,
    application,
    ...repos,
  };
}

describe("CancelCustomerPaymentCommand", () => {
  it("cancels a payment and reverts balance on customer", async () => {
    const { org, payment, customer, customerRepository, command } =
      await buildPaidPayment({ paymentAmount: 10000, saleAmount: 1000 });

    expect(customer.values.balance).toBe(40000);

    const result = await command.execute(
      org,
      validCmd({ paymentId: payment.id.toString() }),
    );

    expect(result.status).toBe("cancelled");
    expect(result.cancelReason).toBe("Pago duplicado");

    const [updatedCustomer] = await customerRepository.findById(
      org.id.toString(),
      customer.id.toString(),
    );
    expect(updatedCustomer!.values.balance).toBe(50000);
    expect(updatedCustomer!.payments[0]!.status).toBe("cancelled");
  });

  it("reverts payments on affected sales", async () => {
    const { org, payment, sale, saleRepository, command, customerPaymentApplicationRepository } =
      await buildPaidPayment();

    await command.execute(
      org,
      validCmd({ paymentId: payment.id.toString() }),
    );

    const [updatedSale] = await saleRepository.findById(
      org.id.toString(),
      sale.id.toString(),
    );
    expect(updatedSale!.values.totalPaid).toBe(0);
    expect(updatedSale!.values.status).toBe("open");

    // Las aplicaciones se conservan; solo se revierten los montos sobre la venta.
    expect(customerPaymentApplicationRepository.getAll()).toHaveLength(1);
  });

  it("transitions a completed sale back to open when payment is fully reverted", async () => {
    const { org, payment, sale, saleRepository, command } =
      await buildPaidPayment({ paymentAmount: 2000, saleAmount: 2000 });

    expect(sale.values.status).toBe("completed");

    await command.execute(
      org,
      validCmd({ paymentId: payment.id.toString() }),
    );

    const [updatedSale] = await saleRepository.findById(
      org.id.toString(),
      sale.id.toString(),
    );
    expect(updatedSale!.values.totalPaid).toBe(0);
    expect(updatedSale!.values.status).toBe("open");
    expect(updatedSale!.values.completedAt).toBeNull();
  });

  it("throws NotFoundError when payment does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(
        org,
        validCmd({ paymentId: "00000000-0000-4000-8000-000000000010" }),
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws PaymentAlreadyCancelledException when payment is already cancelled", async () => {
    const repos = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    const payment = customer.recordPayment(
      1000,
      "cash",
      null,
      UUID.fromString(ownerUserId),
    );
    payment.cancel("Ya cancelado");
    await repos.customerRepository.save(customer);
    await repos.customerPaymentRepository.save(payment);

    await expect(
      repos.command.execute(
        org,
        validCmd({ paymentId: payment.id.toString() }),
      ),
    ).rejects.toThrow(PaymentAlreadyCancelledException);
  });

  it("throws NotFoundError when customer does not exist", async () => {
    const repos = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 50000,
    });
    const payment = customer.recordPayment(
      1000,
      "cash",
      null,
      UUID.fromString(ownerUserId),
    );
    // Solo se persiste el pago; el cliente no existe en el repo.
    await repos.customerPaymentRepository.save(payment);

    await expect(
      repos.command.execute(
        org,
        validCmd({ paymentId: payment.id.toString() }),
      ),
    ).rejects.toThrow(NotFoundError);
  });
});