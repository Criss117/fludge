import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  cancelCustomerPaymentValidator,
  createCustomerPaymentValidator,
  customerPaymentMethodSchema,
} from "../../src/validators/customer-payment.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const OTHER_UUID = "00000000-0000-4000-8000-000000000002";

function expectParsed<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
) {
  const result = schema.safeParse(value);
  expect(result.success, `expected success for ${JSON.stringify(value)}`).toBe(
    true,
  );
  if (!result.success) {
    throw new Error(`expected success but got: ${result.error.message}`);
  }
  return result.data;
}

function expectFirstIssue<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
): string {
  const result = schema.safeParse(value);
  expect(result.success, `expected failure for ${JSON.stringify(value)}`).toBe(
    false,
  );
  if (result.success) {
    throw new Error(`expected failure for ${JSON.stringify(value)}`);
  }
  return result.error.issues[0]?.message ?? "";
}

describe("customerPaymentMethodSchema", () => {
  it("accepts every enum value", () => {
    for (const method of ["cash", "transfer"] as const) {
      expect(expectParsed(customerPaymentMethodSchema, method)).toBe(method);
    }
  });

  it("rejects values outside the enum", () => {
    expect(expectFirstIssue(customerPaymentMethodSchema, "card")).toBe(
      "api_errors.customer_payments.invalid_method",
    );
  });

  it("rejects an empty string, null and undefined", () => {
    expect(expectFirstIssue(customerPaymentMethodSchema, "")).toBe(
      "api_errors.customer_payments.invalid_method",
    );
    expect(expectFirstIssue(customerPaymentMethodSchema, null)).toBe(
      "api_errors.customer_payments.invalid_method",
    );
    expect(expectFirstIssue(customerPaymentMethodSchema, undefined)).toBe(
      "api_errors.customer_payments.invalid_method",
    );
  });
});

const VALID_CREATE_PAYMENT = {
  customerId: VALID_UUID,
  amount: 25000.5,
  method: "cash",
  notes: null,
};

describe("createCustomerPaymentValidator", () => {
  it("accepts a complete valid payload with nullable notes", () => {
    const data = expectParsed(createCustomerPaymentValidator, VALID_CREATE_PAYMENT);
    expect(data.customerId).toBe(VALID_UUID);
    expect(data.amount).toBe(25000.5);
    expect(data.method).toBe("cash");
    expect(data.notes).toBeNull();
  });

  it("accepts a string notes value", () => {
    const data = expectParsed(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      notes: "some note",
    });
    expect(data.notes).toBe("some note");
  });

  it("accepts a payload without notes and with a transfer method", () => {
    const data = expectParsed(createCustomerPaymentValidator, {
      customerId: VALID_UUID,
      amount: 1,
      method: "transfer",
    });
    expect(data.notes).toBeUndefined();
    expect(data.method).toBe("transfer");
  });

  it("accepts a fractional positive amount", () => {
    const data = expectParsed(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      amount: 0.01,
    });
    expect(data.amount).toBe(0.01);
  });

  it("rejects a zero amount", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      amount: 0,
    })).toBe("api_errors.customer_payments.amount_must_be_positive");
  });

  it("rejects a negative amount", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      amount: -5,
    })).toBe("api_errors.customer_payments.amount_must_be_positive");
  });

  it("rejects a non-number amount", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      amount: "10",
    })).toMatch(/expected number/);
  });

  it("rejects an invalid method", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      method: "card",
    })).toBe("api_errors.customer_payments.invalid_method");
  });

  it("rejects an invalid customer id", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      customerId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a non-string notes value", () => {
    expect(expectFirstIssue(createCustomerPaymentValidator, {
      ...VALID_CREATE_PAYMENT,
      notes: 5,
    })).toMatch(/expected string/);
  });
});

const VALID_CANCEL_PAYMENT = {
  customerId: VALID_UUID,
  paymentId: OTHER_UUID,
  reason: "compra cancelada",
};

describe("cancelCustomerPaymentValidator", () => {
  it("accepts a complete valid payload", () => {
    const data = expectParsed(cancelCustomerPaymentValidator, VALID_CANCEL_PAYMENT);
    expect(data.customerId).toBe(VALID_UUID);
    expect(data.paymentId).toBe(OTHER_UUID);
    expect(data.reason).toBe("compra cancelada");
  });

  it("accepts a reason at the minimum length (3)", () => {
    expectParsed(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      reason: "abc",
    });
  });

  it("accepts a reason at the maximum length (500)", () => {
    expectParsed(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      reason: "a".repeat(500),
    });
  });

  it("rejects a reason shorter than 3 characters", () => {
    expect(expectFirstIssue(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      reason: "ab",
    })).toBe("api_errors.customer_payments.reason_too_short");
  });

  it("rejects a reason longer than 500 characters", () => {
    expect(expectFirstIssue(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      reason: "a".repeat(501),
    })).toBe("api_errors.customer_payments.reason_too_long");
  });

  it("rejects a missing reason", () => {
    expect(expectFirstIssue(cancelCustomerPaymentValidator, {
      customerId: VALID_UUID,
      paymentId: OTHER_UUID,
    })).toMatch(/expected string/);
  });

  it("rejects an invalid payment id", () => {
    expect(expectFirstIssue(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      paymentId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects an invalid customer id", () => {
    expect(expectFirstIssue(cancelCustomerPaymentValidator, {
      ...VALID_CANCEL_PAYMENT,
      customerId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });
});