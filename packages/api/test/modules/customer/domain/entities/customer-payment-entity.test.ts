import { describe, expect, it } from "bun:test";

import { CustomerPayment } from "@fludge/api/modules/customer/domain/entities/customer-payment.entity";
import { PaymentAlreadyCancelledException } from "@fludge/api/modules/customer/domain/exceptions/payment-already-cancelled.exception";
import { InvalidPaymentAmountException } from "@fludge/api/modules/customer/domain/exceptions/invalid-payment-amount.exception";
import { UUID } from "@fludge/utils/uuid";

function buildPayment(overrides?: Partial<{
  amount: number;
  method: "cash" | "transfer";
  notes: string | null;
}>) {
  return CustomerPayment.create({
    organizationId: UUID.fromString("00000000-0000-4000-8000-000000000001"),
    createdBy: UUID.fromString("00000000-0000-4000-8000-000000000002"),
    customerId: UUID.fromString("00000000-0000-4000-8000-000000000003"),
    amount: overrides?.amount ?? 50000,
    method: overrides?.method ?? "cash",
    notes: overrides?.notes ?? null,
  });
}

describe("CustomerPayment.create", () => {
  it("creates an active payment with the given values", () => {
    const payment = buildPayment({ amount: 25000, method: "transfer", notes: "Pago mensual" });

    expect(payment.amount).toBe(25000);
    expect(payment.method).toBe("transfer");
    expect(payment.status).toBe("active");
    expect(payment.notes).toBe("Pago mensual");
    expect(payment.id).toBeTruthy();
  });

  it("throws InvalidPaymentAmountException for non-positive amount", () => {
    expect(() => buildPayment({ amount: 0 })).toThrow(InvalidPaymentAmountException);
    expect(() => buildPayment({ amount: -1 })).toThrow(InvalidPaymentAmountException);
  });
});

describe("CustomerPayment.cancel", () => {
  it("cancels the payment and sets cancellation data", () => {
    const payment = buildPayment();

    payment.cancel("Error del cajero");

    expect(payment.status).toBe("cancelled");
    expect(payment.cancellation?.reason).toBe("Error del cajero");
    expect(payment.cancellation?.cancelledAt).toBeInstanceOf(Date);
  });

  it("throws PaymentAlreadyCancelledException when cancelling twice", () => {
    const payment = buildPayment();
    payment.cancel("primera");

    expect(() => payment.cancel("segunda")).toThrow(PaymentAlreadyCancelledException);
  });
});

describe("CustomerPayment.values", () => {
  it("serializes all fields", () => {
    const payment = buildPayment({ amount: 30000, method: "cash" });

    const values = payment.values;

    expect(values.amount).toBe(30000);
    expect(values.method).toBe("cash");
    expect(values.status).toBe("active");
    expect(values.cancelledAt).toBeNull();
    expect(values.cancelReason).toBeNull();
  });

  it("includes cancellation data when cancelled", () => {
    const payment = buildPayment();
    payment.cancel("razón");

    const values = payment.values;

    expect(values.status).toBe("cancelled");
    expect(values.cancelReason).toBe("razón");
    expect(values.cancelledAt).toBeInstanceOf(Date);
  });
});