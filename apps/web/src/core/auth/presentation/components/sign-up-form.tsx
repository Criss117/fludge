import { createContext, use } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  useCreateRootUserForm,
  type FormType,
} from "@repo/ui/auth/hooks/use.create-root-user.form";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Button } from "@/core/shared/components/ui/button";
import { signUpRootUserAction } from "@/core/auth/application/actions/sign-up-root-user.action";

interface Context {
  form: FormType;
}

interface RootProps {
  children: React.ReactNode;
}

const SignUpContext = createContext<Context | null>(null);

function useSignUp() {
  const context = use(SignUpContext);

  if (context === null) {
    throw new Error("useSignUp must be used within a SignUpProvider");
  }

  return context;
}

function Root({ children }: RootProps) {
  const form = useCreateRootUserForm();
  const router = useRouter();

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await signUpRootUserAction(data);

    if (res.error) {
      form.setError("root", {
        message: res.message,
      });
    }

    router.navigate({
      to: "/auth/sign-in",
    });
  });

  return (
    <SignUpContext.Provider
      value={{
        form,
      }}
    >
      <Form {...form}>
        {form.formState.errors.root && (
          <div className="bg-red-200 py-2 border-l-4 border-red-700">
            <p className="text-red-800 font-semibold ml-2">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}
        <form onSubmit={onSubmit}>{children}</form>
      </Form>
    </SignUpContext.Provider>
  );
}

function Email() {
  const { form } = useSignUp();

  return (
    <InputForm
      control={form.control}
      name="email"
      label="Correo electrónico"
      placeholder="Correo electrónico"
      type="email"
      required
    />
  );
}

function Password() {
  const { form } = useSignUp();

  return (
    <InputForm
      control={form.control}
      name="password"
      label="Contraseña"
      placeholder="Contraseña"
      type="password"
      required
    />
  );
}

function FirstName() {
  const { form } = useSignUp();

  return (
    <InputForm
      control={form.control}
      name="firstName"
      label="Nombre"
      placeholder="Nombre"
      required
    />
  );
}

function LastName() {
  const { form } = useSignUp();

  return (
    <InputForm
      control={form.control}
      name="lastName"
      label="Apellido"
      placeholder="Apellido"
      required
    />
  );
}

function UserName() {
  const { form } = useSignUp();

  return (
    <InputForm
      control={form.control}
      name="username"
      label="Nombre de usuario"
      placeholder="Nombre de usuario"
      required
    />
  );
}

function Submit() {
  return (
    <Button type="submit" className="w-full">
      Crear cuenta
    </Button>
  );
}

export const SignUpForm = {
  Root,
  useSignUp,
  Email,
  Password,
  FirstName,
  LastName,
  Submit,
  UserName,
};
