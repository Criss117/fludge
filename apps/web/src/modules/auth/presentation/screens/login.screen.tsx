import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/modules/shared/components/ui/alert";
import { useAuth } from "@/integrations/auth/context";
import { signInEmailSchema } from "@fludge/utils/validators/auth.schemas";

export function LoginScreen() {
  const { signInEmail } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useAuthForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: ({ value }) => {
      signInEmail.mutate(value, {
        onSuccess: (data) => {
          if (!data) return;

          router.navigate({
            to: "/select-organization",
          });
        },
        onError: (error) => {
          setErrorMessage(error.message);
        },
      });
    },
    validators: {
      onSubmit: signInEmailSchema,
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
          <CardDescription>Ingresa a tu Sistema</CardDescription>
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
              name="email"
              children={(field) => <field.EmailField />}
            />
            <form.AppField
              name="password"
              children={(field) => <field.PasswordField />}
            />

            <Button type="submit" className="w-full">
              Entrar al Sistema
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
            No tienes una cuenta?{" "}
            <LinkButton variant="link" className="px-0" to="/auth/register">
              Crea una cuenta nueva
            </LinkButton>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
