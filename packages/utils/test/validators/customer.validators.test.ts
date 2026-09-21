import { describe, expect, it } from "bun:test";

import {
  createCustomerValidator,
  updateCustomerValidator,
} from "@fludge/utils/validators/customer.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

type CreateCustomerInput = {
  name: string;
  phone: string;
  email: string | null;
  creditLimit: number;
  documentType: "CC" | "NIT" | "CE";
  documentNumber: string;
};

function validCreateCustomer(overrides?: Partial<CreateCustomerInput>): CreateCustomerInput {
  return {
    name: "Juan Pérez",
    phone: "573001234567",
    email: "juan@example.com",
    creditLimit: 500000,
    documentType: "CC",
    documentNumber: "1234567890",
    ...overrides,
  };
}

describe("createCustomerValidator", () => {
  it("accepts a valid customer", () => {
    expect(createCustomerValidator.parse(validCreateCustomer())).toEqual(
      validCreateCustomer(),
    );
  });

  it("transforms an empty email to null", () => {
    const result = createCustomerValidator.parse(
      validCreateCustomer({ email: "" }),
    );

    expect(result.email).toBeNull();
  });

  it("rejects an invalid email", () => {
    expect(() =>
      createCustomerValidator.parse(validCreateCustomer({ email: "nope" })),
    ).toThrow();
  });

  it("rejects a non-positive credit limit", () => {
    expect(() =>
      createCustomerValidator.parse(validCreateCustomer({ creditLimit: 0 })),
    ).toThrow();
  });

  it("rejects an invalid document type", () => {
    expect(() =>
      createCustomerValidator.parse(
        validCreateCustomer({ documentType: "XX" as never }),
      ),
    ).toThrow();
  });

  it("rejects a short document number", () => {
    expect(() =>
      createCustomerValidator.parse(
        validCreateCustomer({ documentNumber: "1234" }),
      ),
    ).toThrow();
  });
});

describe("updateCustomerValidator", () => {
  it("accepts a partial update with id", () => {
    const result = updateCustomerValidator.parse({
      id: VALID_UUID,
      name: "María",
    });

    expect(result.name).toBe("María");
  });

  it("transforms an empty email to null on update", () => {
    const result = updateCustomerValidator.parse({
      id: VALID_UUID,
      email: "",
    });

    expect(result.email).toBeNull();
  });

  it("rejects a missing id", () => {
    expect(() => updateCustomerValidator.parse({ name: "María" })).toThrow();
  });
});