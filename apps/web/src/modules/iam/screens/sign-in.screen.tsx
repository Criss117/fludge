import { Link } from "@tanstack/react-router";
import { Button } from "@fludge/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { FieldGroup } from "@fludge/ui/components/field";
import {
  EmailField,
  PasswordField,
} from "@fludge/client/presentation/iam/auth-form/web";
import { useSignInForm } from "@fludge/client/application/iam/auth-form";
import { useAuth } from "@/integrations/auth";

export function SignInScreen() {
  const { signInEmail } = useAuth();
  const form = useSignInForm({
    onSubmit: ({ resetForm, value }) => {
      signInEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
        },
      });
    },
  });

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus datos para continuar</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <FieldGroup>
              <form.AppField name="email">
                {(field) => (
                  <field.EmailField>
                    {(p) => <EmailField {...p} />}
                  </field.EmailField>
                )}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.PasswordField>
                    {(p) => <PasswordField {...p} />}
                  </field.PasswordField>
                )}
              </form.AppField>
            </FieldGroup>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              // disabled={signIn.isPending}
            >
              Iniciar Sesión
            </Button>
          </CardContent>
        </form>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              to="/auth/sign-up"
              className="text-primary underline-offset-4 hover:underline"
            >
              Crea una
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
