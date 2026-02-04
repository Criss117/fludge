import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc";
import { AlertCircleIcon, User } from "lucide-react";
import { LinkButton } from "@/modules/shared/components/link-button";
import { Logo } from "@/modules/shared/components/logo";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Separator } from "@/modules/shared/components/ui/separator";
import { useAuthForm } from "../components/auth-form";
import { signUpFormSchema } from "@fludge/utils/validators/auth.schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/modules/shared/components/ui/alert";
import { FieldGroup } from "@/modules/shared/components/ui/field";

export function RegisterScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const signUp = useMutation(orpc.auth.signUp.root.mutationOptions());

  const form = useAuthForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      repeatPassword: "",
    },
    onSubmit: ({ value }) => {
      signUp.mutate(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.navigate({ to: "/" });
          },
          onError: (error) => {
            setErrorMessage(error.message);
          },
        },
      );
    },
    validators: {
      onSubmit: signUpFormSchema,
    },
  });

  return (
    <main className="mx-auto w-full max-w-xl min-h-dvh flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="flex items-center flex-col">
          <div className="flex items-center gap-x-2">
            <Logo size={60} />
            <CardTitle className="text-4xl font-semibold text-primary">
              Fludge
            </CardTitle>
          </div>
          <CardDescription>
            Gestiona tu inventario, clientes y ventas de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Hubo un error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.AppField
              name="name"
              children={(field) => <field.NameField />}
            />
            <form.AppField
              name="email"
              children={(field) => <field.EmailField />}
            />

            <FieldGroup className="flex justify-between flex-row items-center">
              <form.AppField
                name="password"
                children={(field) => <field.PasswordField hideForgotPassword />}
              />

              <form.AppField
                name="repeatPassword"
                children={(field) => (
                  <field.PasswordField
                    hideForgotPassword
                    label="Confirmar contraseña"
                  />
                )}
              />
            </FieldGroup>

            <Button type="submit" className="w-full">
              Registrase
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-y-5">
          <div className="flex w-full items-center gap-x-2">
            <Separator className="flex-1" />
            <p className="uppercase">o tambien</p>
            <Separator className="flex-1" />
          </div>

          <LinkButton className="w-full" variant="outline" to="/auth/employee">
            <User size={20} />
            Iniciar como empleado
          </LinkButton>

          <div>
            Ya tienes una cuenta?{" "}
            <LinkButton variant="link" className="px-0" to="/">
              Inicia sesion
            </LinkButton>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
