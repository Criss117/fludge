import { signUpValidator } from "@fludge/utils/validators/auth.validators";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export type RegisterMemberSchema = z.infer<typeof signUpValidator>;

export type OnRegisterMemberSubmit = {
  onSubmit: (options: {
    value: RegisterMemberSchema;
    resetForm: () => void;
  }) => void;
};

export function registerFormOptions(options: OnRegisterMemberSubmit) {
  return formOptions({
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      name: "",
    },
    validators: {
      onChange: signUpValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
