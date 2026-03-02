import { auth } from "@fludge/auth";
import type { SignUpEmailSchema } from "@fludge/utils/validators/auth.schemas";

export class SignUpEmailUseCase {
  public async execute(values: SignUpEmailSchema) {
    return auth.api.signUpEmail({
      body: {
        email: values.email,
        name: values.name,
        password: values.password,
        cc: values.cc,
        phone: values.phone?.toString(),
        address: values.address,
        isRoot: true,
      },
    });
  }
}

export const signUpEmailUseCase = new SignUpEmailUseCase();
