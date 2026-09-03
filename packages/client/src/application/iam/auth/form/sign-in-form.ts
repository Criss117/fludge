import {
  signInValidator,
  signUpValidator,
} from "@fludge/utils/validators/auth.validators";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export type SignInSchema = z.infer<typeof signInValidator>;
export type SignUpSchema = z.infer<typeof signUpValidator>;

export type OnSignUpSubmit = {
  onSubmit: (options: { value: SignUpSchema; resetForm: () => void }) => void;
};

export type OnSignInSubmit = {
  onSubmit: (options: { value: SignInSchema; resetForm: () => void }) => void;
};

export function signUpFormOptions(options: OnSignUpSubmit) {
  return formOptions({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
    validators: {
      onChange: signUpValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function signInFormOptions(options: OnSignInSubmit) {
  return formOptions({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
