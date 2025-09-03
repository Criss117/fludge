import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { SignInRootUserForm } from "../components/sign-in-root-user-form";
import { Button } from "@/core/shared/components/ui/button";
import { Link } from "@tanstack/react-router";

export function SignInRootUserScreen() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-5xl text-primary font-bold text-center">
            Fludge
          </h1>
          <CardTitle className="text-2xl font-bold">Inicia sesión</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta de Fludge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SignInRootUserForm.Root>
            <fieldset className="space-y-5">
              <SignInRootUserForm.Email />
              <SignInRootUserForm.Password />
              <SignInRootUserForm.Submit />
            </fieldset>
          </SignInRootUserForm.Root>
        </CardContent>
        <CardFooter>
          <Button asChild variant="link">
            <Link to="/auth/employee/sign-in">Inicia Sesión como Empleado</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
