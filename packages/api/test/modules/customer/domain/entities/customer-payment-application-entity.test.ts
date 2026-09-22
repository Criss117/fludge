import { describe, expect, it } from "bun:test";

import { CustomerPaymentApplication } from "@fludge/api/modules/customer/domain/entities/customer-payment-application.entity";
import type { CustomerPaymentApplicationSelect } from "@fludge/db/schema/customer-payment-application.schema";
import { UUID } from "@fludge/utils/uuid";

const PAYMENT_ID = "00000000-0000-4000-8000-000000000001";
const SALE_ID = "00000000-0000-4000-8000-000000000002";

function buildApplication(overrides?: Partial<{ amount: number }>) {
  return CustomerPaymentApplication.create({
    paymentId: UUID.fromString(PAYMENT_ID),
    saleId: UUID.fromString(SALE_ID),
    amount: overrides?.amount ?? 3000,
  });
}

function buildRow(overrides?: Partial<{ amount: number; createdAt: Date }>) {
  return {
    paymentId: PAYMENT_ID,
    saleId: SALE_ID,
    amount: overrides?.amount ?? 3000,
    createdAt: overrides?.createdAt ?? new Date("2025-01-10T12:30:00.000Z"),
  } satisfies CustomerPaymentApplicationSelect;
}

describe("CustomerPaymentApplication.create", () => {
  it("creates an application with the given fields", () => {
    const application = buildApplication({ amount: 5000 });

    expect(application.paymentId.toString()).toBe(PAYMENT_ID);
    expect(application.saleId.toString()).toBe(SALE_ID);
    expect(application.amount).toBe(5000);
    expect(application.createdAt).toBeInstanceOf(Date);
  });
});

describe("CustomerPaymentApplication.reconstitute", () => {
  it("restores the application from a DB row", () => {
    const createdAt = new Date("2025-01-10T12:30:00.000Z");
    const application = CustomerPaymentApplication.reconstitute(
      buildRow({ amount: 8000, createdAt }),
    );

    expect(application.paymentId.toString()).toBe(PAYMENT_ID);
    expect(application.saleId.toString()).toBe(SALE_ID);
    expect(application.amount).toBe(8000);
    expect(application.createdAt).toEqual(createdAt);
  });
});

describe("CustomerPaymentApplication.values", () => {
  it("serializes all fields", () => {
    const application = buildApplication({ amount: 12000 });

    const values = application.values;

    expect(values.paymentId).toBe(PAYMENT_ID);
    expect(values.saleId).toBe(SALE_ID);
    expect(values.amount).toBe(12000);
    expect(values.createdAt).toBeInstanceOf(Date);
  });
});