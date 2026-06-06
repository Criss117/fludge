import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { z } from "zod";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { NameField, EmailField, PasswordField, PhoneField },
  formComponents: {},
});

export type FieldInput<T, Extra = {}> = {
  field: ReturnType<typeof useFieldContext<T>>;
  id: string;
  isInvalid: boolean;
} & Extra;

function NameField<Extra>({
  children,
  extra,
}: {
  children: (props: FieldInput<string, Extra>) => React.ReactNode;
  extra?: Extra;
}) {
  const field = useFieldContext<string>();
  const id = "auth-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid, ...(extra ?? {}) } as FieldInput<
    string,
    Extra
  >);
}

function EmailField<Extra>({
  children,
  extra,
}: {
  children: (props: FieldInput<string, Extra>) => React.ReactNode;
  extra?: Extra;
}) {
  const field = useFieldContext<string>();
  const id = "auth-form-email";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid, ...(extra ?? {}) } as FieldInput<
    string,
    Extra
  >);
}

function PasswordField<Extra>({
  children,
  extra,
}: {
  children: (props: FieldInput<string, Extra>) => React.ReactNode;
  extra?: Extra;
}) {
  const field = useFieldContext<string>();
  const id = "auth-form-password";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid, ...(extra ?? {}) } as FieldInput<
    string,
    Extra
  >);
}

function PhoneField<Extra>({
  children,
  extra,
}: {
  children: (props: FieldInput<string, Extra>) => React.ReactNode;
  extra?: Extra;
}) {
  const field = useFieldContext<string>();
  const id = "auth-form-phone";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid, ...(extra ?? {}) } as FieldInput<
    string,
    Extra
  >);
}

const signInSchema = z.object({
  email: z.email({ error: "Ingresa un email válido" }),
  password: z.string().min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  }),
});

const signUpSchema = z.object({
  email: z.email({
    error: "El email es requerido",
  }),
  password: z
    .string({
      error: "La contraseña es requerida",
    })
    .min(8, {
      error: "La contraseña es muy corta",
    })
    .max(50, {
      error: "La contraseña es muy larga",
    }),
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  phone: z
    .string({
      error: "El teléfono es requerido",
    })
    .min(9, {
      error: "El teléfono es muy corto",
    })
    .max(15, {
      error: "El teléfono es muy largo",
    }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;

type OnSignInSubmit = {
  onSubmit: (options: { value: SignInSchema; resetForm: () => void }) => void;
};

type OnSignUpSubmit = {
  onSubmit: (options: { value: SignUpSchema; resetForm: () => void }) => void;
};

export function useSignUpForm(options: OnSignUpSubmit) {
  return useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useSignInForm(options: OnSignInSubmit) {
  return useAppForm({
    defaultValues: {
      email: "natalia@fludge.dev",
      password: "holiwiss",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
