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
  NameField,
  PhoneField,
} from "@fludge/client/presentation/iam/auth-form/web";
import { useSignUpForm } from "@fludge/client/application/iam/forms/auth.form";
import { useAuth } from "@/integrations/auth/provider";

export function SignUpScreen() {
  const { signUp } = useAuth();

  const form = useSignUpForm({
    onSubmit: ({ resetForm, value }) => {
      signUp.mutate(value, {
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
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>Completa los datos para registrarte</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.NameField>
                    {(p) => <NameField {...p} />}
                  </field.NameField>
                )}
              </form.AppField>
              <form.AppField name="phone">
                {(field) => (
                  <field.PhoneField>
                    {(p) => <PhoneField {...p} />}
                  </field.PhoneField>
                )}
              </form.AppField>
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
            <Button type="submit" className="w-full" size="lg">
              Crear Cuenta
            </Button>
          </CardContent>
        </form>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/auth/sign-in"
              className="text-primary underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
