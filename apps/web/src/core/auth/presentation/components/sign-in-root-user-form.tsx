import { createContext, use } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  useSignInForm,
  type FormType,
} from "@repo/ui/auth/hooks/use.sign-in.form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Form } from "@/core/shared/components/ui/form";
import { Button } from "@/core/shared/components/ui/button";
import { signInRootUserAction } from "@/core/auth/application/actions/sign-in-root-user.action";
import { useAuth } from "@/core/auth/application/providers/auth.provider";

interface RootProps {
  children: React.ReactNode;
}

interface Context {
  form: FormType;
}

const SignInContext = createContext<Context | null>(null);

function useSignInContext() {
  const context = use(SignInContext);

  if (context === null) {
    throw new Error("useSignInContext must be used within a SignInProvider");
  }

  return context;
}

function Root({ children }: RootProps) {
  const form = useSignInForm();
  const router = useRouter();
  const { signIn } = useAuth();

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await signInRootUserAction(data);

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

        if (logedUser.isRootIn.length === 0) {
          router.navigate({
            to: "/business/register",
          });

          return;
        }

        if (logedUser.isRootIn.length === 1) {
          router.navigate({
            to: "/business/$id",
            params: {
              id: logedUser.isRootIn[0].id,
            },
          });

          return;
        }

        router.navigate({
          to: "/business/select-business",
        });
      },
    });
  });

  return (
    <SignInContext.Provider
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
    </SignInContext.Provider>
  );
}

function Email() {
  const { form } = useSignInContext();

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
  const { form } = useSignInContext();

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
  return (
    <Button type="submit" className="w-full">
      Iniciar sesión
    </Button>
  );
}

export const SignInRootUserForm = {
  Root,
  useSignInContext,
  Email,
  Password,
  Submit,
};
