import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { SignUpForm } from "../components/sign-up-form";
import { Link } from "@tanstack/react-router";

export function SignUpScreen() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-5xl text-primary font-bold text-center">
            Fludge
          </h1>
          <CardTitle className="text-2xl font-bold">Crear Cuenta POS</CardTitle>
          <CardDescription>
            Completa los datos para crear tu cuenta en Fludge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SignUpForm.Root>
            <fieldset className="space-y-5">
              <fieldset className="flex gap-x-2">
                <legend className="sr-only">Datos de usuario</legend>
                <SignUpForm.FirstName />
                <SignUpForm.LastName />
              </fieldset>
              <fieldset className="space-y-5">
                <SignUpForm.UserName />
                <SignUpForm.Email />
              </fieldset>
              <fieldset className="flex gap-x-2">
                <SignUpForm.Password />
                <SignUpForm.Password />
              </fieldset>
              <SignUpForm.Submit />
            </fieldset>
          </SignUpForm.Root>

          <article className="flex justify-between">
            <Button asChild variant="link">
              <Link to="/auth/sign-in">Ya tienes una cuenta?</Link>
            </Button>
            <Button asChild variant="link">
              <a href="/auth/forgot-password">Olvidaste tu contraseña?</a>
            </Button>
          </article>
        </CardContent>
      </Card>
    </section>
  );
}
