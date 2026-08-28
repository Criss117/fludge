import { describe, expect, it } from "bun:test";
import { registerMemberSchema } from "@fludge/client/application/iam/organization/form/register-member-form";

const validMember = {
  email: "member@example.com",
  password: "secret1",
  phone: "3212345678",
  name: "Juan Pérez",
};

describe("registerMemberSchema", () => {
  it("accepts a valid member registration", () => {
    expect(registerMemberSchema.safeParse(validMember).success).toBe(true);
  });

  it("rejects a short password with the Spanish validation message", () => {
    const result = registerMemberSchema.safeParse({
      ...validMember,
      password: "abc",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "La contraseña debe tener al menos 6 caracteres",
      );
    }
  });

  it("rejects invalid email and short phone and name", () => {
    const result = registerMemberSchema.safeParse({
      email: "not-an-email",
      password: validMember.password,
      phone: "1234567",
      name: "A",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Ingresa un email válido",
        "El teléfono es muy corto",
        "El nombre es muy corto",
      ]);
    }
  });
});
