import { createContext, use } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  type FormType,
  useCreateBusinessForm,
} from "@repo/ui/business/hooks/use.create-business-form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Form } from "@/core/shared/components/ui/form";
import { Button } from "@/core/shared/components/ui/button";
import { createBusinessAction } from "@/core/business/application/actions/create-business.action";
import { useAuth } from "@/core/auth/application/providers/auth.provider";

interface RootProps {
  children: React.ReactNode;
}

interface Context {
  form: FormType;
}

const RegisterBusinessContext = createContext<Context | null>(null);

function useRegisterBusiness() {
  const context = use(RegisterBusinessContext);
  if (!context) {
    throw new Error(
      "useRegisterBusiness must be used within a RegisterBusinessProvider"
    );
  }
  return context;
}

function Root({ children }: RootProps) {
  const form = useCreateBusinessForm();
  const router = useRouter();
  const { refetchProfile } = useAuth();

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await createBusinessAction(data);

    if (res.error) {
      form.setError("root", {
        message: res.message,
      });

      return;
    }
    if (!res.data) {
      form.setError("root", {
        message: "Error al registrar un negocio",
      });
      return;
    }

    await refetchProfile();

    router.navigate({
      to: "/business/$id",
      params: {
        id: res.data.id,
      },
    });
  });

  return (
    <RegisterBusinessContext.Provider value={{ form }}>
      <Form {...form}>
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        <form onSubmit={onSubmit}>{children}</form>
      </Form>
    </RegisterBusinessContext.Provider>
  );
}

function Name() {
  const { form } = useRegisterBusiness();

  return (
    <InputForm
      control={form.control}
      name="name"
      label="Nombre del negocio"
      placeholder="Nombre del negocio"
    />
  );
}

function NIT() {
  const { form } = useRegisterBusiness();

  return (
    <InputForm
      control={form.control}
      name="nit"
      label="NIT"
      placeholder="NIT"
    />
  );
}

function Address() {
  const { form } = useRegisterBusiness();

  return (
    <InputForm
      control={form.control}
      name="address"
      label="Dirección"
      placeholder="Dirección"
    />
  );
}

function City() {
  const { form } = useRegisterBusiness();

  return (
    <InputForm
      control={form.control}
      name="city"
      label="Ciudad"
      placeholder="Ciudad"
    />
  );
}

function State() {
  const { form } = useRegisterBusiness();

  return (
    <InputForm
      control={form.control}
      name="state"
      label="Pais"
      placeholder="Pais"
    />
  );
}

function Submit() {
  return (
    <Button type="submit" className="w-full">
      Registrar
    </Button>
  );
}

export const RegisterBusinessForm = {
  useRegisterBusiness,
  Root,
  Name,
  NIT,
  Address,
  City,
  State,
  Submit,
};
