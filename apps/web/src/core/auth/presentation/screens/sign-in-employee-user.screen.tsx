import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { Link } from "@tanstack/react-router";
import { SignInEmployeeUserForm } from "../components/sign-in-employee-user-form";

export function SignInEMployeeUserScreen() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-5xl text-primary font-bold text-center">
            Fludge
          </h1>
          <CardTitle className="text-2xl font-bold">Inicia sesión</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta de empleado en Fludge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SignInEmployeeUserForm.Root>
            <fieldset className="space-y-5">
              <SignInEmployeeUserForm.Username />
              <SignInEmployeeUserForm.Password />
              <SignInEmployeeUserForm.Submit />
            </fieldset>
          </SignInEmployeeUserForm.Root>
        </CardContent>
        <CardFooter>
          <Button asChild variant="link">
            <Link to="/auth/sign-in">Inicia Sesión como usuario root</Link>
          </Button>

          <Button asChild variant="link">
            <Link to="/auth/sign-up">No tienes una cuenta? Crea una</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
