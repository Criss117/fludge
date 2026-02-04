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
import {
  Field,
  FieldLabel,
  FieldSet,
} from "@/modules/shared/components/ui/field";
import { Input } from "@/modules/shared/components/ui/input";
import { Separator } from "@/modules/shared/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { EyeClosed, EyeIcon, LockIcon, MailIcon, User } from "lucide-react";
import { useState } from "react";

export function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);

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
        <CardContent>
          <form action="" className="space-y-5">
            <Field className="gap-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="flex relative">
                <MailIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={20}
                />
                <Input
                  className="pl-10"
                  id="email"
                  type="text"
                  placeholder="micorreo@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
            </Field>

            <Field className="gap-0">
              <div className="flex justify-between">
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <LinkButton variant="link" to="/auth/forgot-password">
                  Olvidaste tu contraseña?
                </LinkButton>
              </div>
              <div className="flex relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={20}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((pre) => !pre)}
                >
                  {showPassword ? (
                    <EyeClosed size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </Button>

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  autoComplete="current-password"
                  className="pl-10"
                  required
                />
              </div>
            </Field>

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
