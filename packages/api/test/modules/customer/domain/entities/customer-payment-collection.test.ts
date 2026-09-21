import { describe, expect, it } from "bun:test";

import { CustomerPaymentCollection } from "@fludge/api/modules/customer/domain/entities/customer-payment.collection";
import { CustomerPayment } from "@fludge/api/modules/customer/domain/entities/customer-payment.entity";
import { CustomerPaymentNotFoundException } from "@fludge/api/modules/customer/domain/exceptions/customer-payment-not-found.exception";
import { UUID } from "@fludge/utils/uuid";

function makePayment(amount = 10000) {
  return CustomerPayment.create({
    organizationId: UUID.fromString("00000000-0000-4000-8000-000000000001"),
    createdBy: UUID.fromString("00000000-0000-4000-8000-000000000002"),
    customerId: UUID.fromString("00000000-0000-4000-8000-000000000003"),
    amount,
    method: "cash",
    notes: null,
  });
}

describe("CustomerPaymentCollection", () => {
  it("starts empty", () => {
    const collection = new CustomerPaymentCollection();

    expect(collection.getAll()).toHaveLength(0);
    expect(collection.length).toBe(0);
  });

  it("adds a payment", () => {
    const collection = new CustomerPaymentCollection();
    const payment = makePayment();

    collection.add(payment);

    expect(collection.getAll()).toHaveLength(1);
    expect(collection.findById(payment.id.toString())).toBe(payment);
  });

  it("finds a payment by id", () => {
    const collection = new CustomerPaymentCollection();
    const payment = makePayment();
    collection.add(payment);

    const found = collection.findById(payment.id.toString());

    expect(found).toBe(payment);
  });

  it("returns null when payment is not found", () => {
    const collection = new CustomerPaymentCollection();

    expect(collection.findById("non-existent")).toBeNull();
  });

  it("updates an existing payment", () => {
    const collection = new CustomerPaymentCollection();
    const payment = makePayment();
    collection.add(payment);
    payment.cancel("razón");

    collection.update(payment);

    const updated = collection.findById(payment.id.toString())!;
    expect(updated.status).toBe("cancelled");
  });

  it("throws CustomerPaymentNotFoundException when updating non-existent", () => {
    const collection = new CustomerPaymentCollection();
    const payment = makePayment();

    expect(() => collection.update(payment)).toThrow(CustomerPaymentNotFoundException);
  });

  it("filters active payments", () => {
    const collection = new CustomerPaymentCollection();
    const active = makePayment(10000);
    const cancelled = makePayment(20000);
    cancelled.cancel("razón");

    collection.add(active);
    collection.add(cancelled);

    expect(collection.getActive()).toHaveLength(1);
    expect(collection.getActive()[0]!.amount).toBe(10000);
  });

  it("returns all payments", () => {
    const collection = new CustomerPaymentCollection();
    collection.add(makePayment(10000));
    collection.add(makePayment(20000));

    expect(collection.getAll()).toHaveLength(2);
  });
});