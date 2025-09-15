import { createContext, use } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  useSignInForm,
  type FormType,
} from "@repo/ui/auth/hooks/use.sign-in.form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Form } from "@/core/shared/components/ui/form";
import { Button } from "@/core/shared/components/ui/button";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import { useSignInRootUser } from "@/core/auth/application/hooks/use.sign-in-root-user";

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
  const { mutateAsync } = useSignInRootUser();
  const { signIn } = useAuth();
  const form = useSignInForm();
  const router = useRouter();

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await mutateAsync(data, {
      onError: (err: Error) => {
        form.setError("root", {
          message: err.cause as string,
        });
      },
    });

    if (!res.data || res.error) {
      form.setError("root", { message: res.message });

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
