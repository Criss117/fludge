import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { RegisterBusinessForm } from "../components/register-business-form";

export function RegisterBusinessScreen() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-5xl text-primary font-bold text-center">
            Fludge
          </h1>
          <CardTitle className="text-2xl font-bold">
            Registrar Negocio
          </CardTitle>
          <CardDescription>
            Completa los datos de tu negocio para FLUDGE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RegisterBusinessForm.Root>
            <fieldset className="space-y-5">
              <RegisterBusinessForm.Name />
              <RegisterBusinessForm.NIT />
              <RegisterBusinessForm.Address />
              <fieldset className="flex gap-x-2">
                <RegisterBusinessForm.City />
                <RegisterBusinessForm.State />
              </fieldset>
              <RegisterBusinessForm.Submit />
            </fieldset>
          </RegisterBusinessForm.Root>
        </CardContent>
      </Card>
    </section>
  );
}
