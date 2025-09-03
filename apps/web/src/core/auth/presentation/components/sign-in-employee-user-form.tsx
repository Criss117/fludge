import { createContext, use, useId } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  useSignInEmployeeForm,
  type FormType,
} from "@repo/ui/auth/hooks/use.sign-in-employee-form";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Button } from "@/core/shared/components/ui/button";
import { signInEmployeeUserAction } from "@/core/auth/application/actions/sign-in-employee-user.action";
import { useAuth } from "@/core/auth/application/providers/auth.provider";

interface Context {
  form: FormType;
  formId: string;
}

interface RootProps {
  children: React.ReactNode;
}

const SignInEmployeeUserContext = createContext<Context | null>(null);

function useSignInEmployeeUserContext() {
  const context = use(SignInEmployeeUserContext);

  if (context === null) {
    throw new Error(
      "useSignInEmployeeUserContext must be used within a SignInEmployeeUserProvider"
    );
  }

  return context;
}

function Root({ children }: RootProps) {
  const form = useSignInEmployeeForm();
  const formId = `sign-in-employee-user-form-${useId()}`;
  const router = useRouter();
  const { signIn } = useAuth();

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await signInEmployeeUserAction(data);

    if (res.error) {
      form.setError("root", {
        message: res.message,
      });

      return;
    }

    if (!res.data) {
      form.setError("root", {
        message: "Error al iniciar sesión",
      });

      return;
    }

    signIn(res.data, {
      onSuccess: (logedUser) => {
        router.options.context.user = logedUser;

        router.navigate({
          to: "/business/$id",
          params: {
            id: logedUser.isEmployeeIn[0].id,
          },
        });
      },
    });
  });

  return (
    <SignInEmployeeUserContext.Provider
      value={{
        form,
        formId,
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
        <form onSubmit={onSubmit} id={formId}>
          {children}
        </form>
      </Form>
    </SignInEmployeeUserContext.Provider>
  );
}

function Username() {
  const { form } = useSignInEmployeeUserContext();

  return (
    <InputForm
      control={form.control}
      name="username"
      label="Nombre de usuario"
      placeholder="Nombre de usuario"
      type="text"
      required
    />
  );
}

function Password() {
  const { form } = useSignInEmployeeUserContext();

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

function Submit() {
  const { formId } = useSignInEmployeeUserContext();

  return (
    <Button form={formId} type="submit" className="w-full">
      Iniciar sesión
    </Button>
  );
}

export const SignInEmployeeUserForm = {
  useSignInEmployeeUserContext,
  Root,
  Username,
  Password,
  Submit,
};
