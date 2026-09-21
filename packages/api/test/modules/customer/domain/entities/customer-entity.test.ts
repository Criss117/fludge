import { describe, expect, it } from "bun:test";

import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import { CustomerBalance } from "@fludge/api/modules/customer/domain/value-objects/customer-balance";
import { CustomerDocument } from "@fludge/api/modules/customer/domain/value-objects/document-type";
import { CantIncreaseBalanceException } from "@fludge/api/modules/customer/domain/exceptions/cant-increase-balance.exception";
import { CantDecreaseBalanceException } from "@fludge/api/modules/customer/domain/exceptions/cant-decrease-balance.exception";
import { AmountMustBePositiveException } from "@fludge/api/modules/shared/domain/exceptions/amount-must-be-positive.exception";
import { UUID } from "@fludge/utils/uuid";
import type { CustomerSelect } from "@fludge/db/schema/customer.schema";
import { buildCustomer, makeCustomerOrganizationId, makeCustomerUserId } from "@test/support/builders/customer.builder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCustomerSelect(): CustomerSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    organizationId: makeCustomerOrganizationId().toString(),
    createdBy: makeCustomerUserId().toString(),
    name: "Juan Pérez",
    phone: "+57 300 123 4567",
    email: "juan@example.com",
    balance: 100000,
    creditLimit: 500000,
    documentType: "CC",
    documentNumber: "1234567890",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("Customer.create", () => {
  it("creates a customer with active status and zero balance", () => {
    const customer = buildCustomer();

    expect(customer.values.name).toBe("Juan Pérez");
    expect(customer.values.phone).toBe("+57 300 123 4567");
    expect(customer.values.email).toBe("juan@example.com");
    expect(customer.values.creditLimit).toBe(500000);
    expect(customer.values.balance).toBe(0);
    expect(customer.values.documentType).toBe("CC");
    expect(customer.values.documentNumber).toBe("1234567890");
    expect(customer.values.status).toBe("active");
    expect(customer.values.id).toBeTruthy();
    expect(customer.values.createdAt).toBeInstanceOf(Date);
  });

  it("stores organization and creator ids", () => {
    const customer = buildCustomer();

    expect(customer.values.organizationId).toBe(
      makeCustomerOrganizationId().toString(),
    );
    expect(customer.values.createdBy).toBe(makeCustomerUserId().toString());
  });

  it("allows null email", () => {
    const customer = buildCustomer({ email: null });

    expect(customer.values.email).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Customer.reconstitute", () => {
  it("rebuilds a customer from select values", () => {
    const values = buildCustomerSelect();
    const customer = Customer.reconstitute(values);

    expect(customer.values.id).toBe(values.id);
    expect(customer.values.name).toBe(values.name);
    expect(customer.values.phone).toBe(values.phone);
    expect(customer.values.email).toBe(values.email);
    expect(customer.values.balance).toBe(values.balance);
    expect(customer.values.creditLimit).toBe(values.creditLimit);
    expect(customer.values.documentType).toBe(values.documentType);
    expect(customer.values.documentNumber).toBe(values.documentNumber);
    expect(customer.values.status).toBe(values.status);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("Customer.update", () => {
  it("updates contact fields", () => {
    const customer = buildCustomer();

    customer.update({
      name: "María Gómez",
      phone: "+57 311 000 0000",
      email: "maria@example.com",
    });

    expect(customer.values.name).toBe("María Gómez");
    expect(customer.values.phone).toBe("+57 311 000 0000");
    expect(customer.values.email).toBe("maria@example.com");
  });

  it("clears email when null is provided", () => {
    const customer = buildCustomer();

    customer.update({ email: null });

    expect(customer.values.email).toBeNull();
  });

  it("updates credit limit keeping the balance", () => {
    const customer = buildCustomer({ creditLimit: 500000 });
    customer.increaseBalance(100000);

    customer.update({ creditLimit: 1000000 });

    expect(customer.values.creditLimit).toBe(1000000);
    expect(customer.values.balance).toBe(100000);
  });

  it("updates document fields", () => {
    const customer = buildCustomer();

    customer.update({
      documentType: "NIT",
      documentNumber: "900123456",
    });

    expect(customer.values.documentType).toBe("NIT");
    expect(customer.values.documentNumber).toBe("900123456");
  });

  it("updates the status", () => {
    const customer = buildCustomer();

    customer.update({ status: "inactive" });

    expect(customer.values.status).toBe("inactive");
  });

  it("touches the updatedAt timestamp", () => {
    const customer = buildCustomer();
    const before = customer.values.updatedAt.getTime();

    customer.update({ name: "Otro" });

    expect(customer.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("returns the customer instance for chaining", () => {
    const customer = buildCustomer();

    const returned = customer.update({ name: "Otro" });

    expect(returned).toBe(customer);
  });
});

// ---------------------------------------------------------------------------
// balance operations
// ---------------------------------------------------------------------------

describe("Customer balance operations", () => {
  it("increases the balance", () => {
    const customer = buildCustomer({ creditLimit: 500000 });

    customer.increaseBalance(100000);

    expect(customer.values.balance).toBe(100000);
  });

  it("decreases the balance", () => {
    const customer = buildCustomer({ creditLimit: 500000 });
    customer.increaseBalance(100000);

    customer.decreaseBalance(40000);

    expect(customer.values.balance).toBe(60000);
  });

  it("returns the customer instance for chaining", () => {
    const customer = buildCustomer({ creditLimit: 500000 });

    expect(customer.increaseBalance(1000)).toBe(customer);
    expect(customer.decreaseBalance(500)).toBe(customer);
  });
});

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe("Customer.values", () => {
  it("serializes balance and document", () => {
    const customer = buildCustomer({ creditLimit: 500000 });
    customer.increaseBalance(100000);

    const values = customer.values;

    expect(values.balance).toBe(100000);
    expect(values.creditLimit).toBe(500000);
    expect(values.documentType).toBe("CC");
    expect(values.documentNumber).toBe("1234567890");
  });
});

// ---------------------------------------------------------------------------
// CustomerBalance
// ---------------------------------------------------------------------------

describe("CustomerBalance", () => {
  it("rejects negative balance and credit limit", () => {
    expect(() => new CustomerBalance(-1, 100)).toThrow(
      "Balance cannot be negative",
    );
    expect(() => new CustomerBalance(0, -1)).toThrow(
      "Credit limit cannot be negative",
    );
  });

  it("computes available credit and debt state", () => {
    const balance = new CustomerBalance(100, 500);

    expect(balance.availableCredit).toBe(400);
    expect(balance.isOverLimit()).toBe(false);
    expect(balance.hasDebt()).toBe(true);
    expect(balance.isSettled()).toBe(false);

    expect(new CustomerBalance(0, 500).isSettled()).toBe(true);
    expect(new CustomerBalance(600, 500).isOverLimit()).toBe(true);
  });

  it("canIncrease checks the limit", () => {
    const balance = new CustomerBalance(400, 500);

    expect(balance.canIncrease(100)).toBe(true);
    expect(balance.canIncrease(101)).toBe(false);
  });

  it("increaseBalance adds and throws when over the limit", () => {
    const balance = new CustomerBalance(400, 500);

    expect(balance.increaseBalance(100).balance).toBe(500);
    expect(() => balance.increaseBalance(101)).toThrow(
      CantIncreaseBalanceException,
    );
  });

  it("decreaseBalance subtracts and throws when exceeding the balance", () => {
    const balance = new CustomerBalance(100, 500);

    expect(balance.decreaseBalance(100).balance).toBe(0);
    expect(() => balance.decreaseBalance(101)).toThrow(
      CantDecreaseBalanceException,
    );
  });

  it("throws AmountMustBePositiveException for negative amounts", () => {
    const balance = new CustomerBalance(100, 500);

    expect(() => balance.increaseBalance(-1)).toThrow(
      AmountMustBePositiveException,
    );
    expect(() => balance.decreaseBalance(-1)).toThrow(
      AmountMustBePositiveException,
    );
  });

  it("withCreditLimit returns a new balance with the new limit", () => {
    const balance = new CustomerBalance(100, 500);

    expect(balance.withCreditLimit(1000).creditLimit).toBe(1000);
    expect(balance.withCreditLimit(1000).balance).toBe(100);
  });

  it("equals compares balance and limit", () => {
    const a = new CustomerBalance(100, 500);
    const b = new CustomerBalance(100, 500);
    const c = new CustomerBalance(100, 600);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("zero creates a settled balance", () => {
    const zero = CustomerBalance.zero(1000);

    expect(zero.balance).toBe(0);
    expect(zero.creditLimit).toBe(1000);
    expect(zero.isSettled()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CustomerDocument
// ---------------------------------------------------------------------------

describe("CustomerDocument", () => {
  it("stores type and number", () => {
    const document = new CustomerDocument("CC", "1234567890");

    expect(document.value).toEqual({ type: "CC", number: "1234567890" });
  });
});