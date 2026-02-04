import { useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  createOrganizationSchema,
  type CreateOrganizationSchema,
} from "@fludge/utils/validators/organization.schema";
import { Logo } from "@/modules/shared/components/logo";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/modules/shared/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { useRegisterOrganizationForm } from "../components/register-organization-form";
import { Button } from "@/modules/shared/components/ui/button";
import { orpc } from "@/integrations/orpc";
import { FieldGroup } from "@/modules/shared/components/ui/field";

const defaultValues: CreateOrganizationSchema = {
  name: "",
  legalName: "",
  address: "",
};

export function RegisterOrganizationScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const register = useMutation(orpc.organizations.create.mutationOptions());

  const form = useRegisterOrganizationForm({
    validators: {
      onSubmit: createOrganizationSchema,
      onBlur: createOrganizationSchema,
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      register.mutate(value, {
        onError: (error) => {
          setErrorMessage(error.message);
        },
        onSuccess: () => {
          setErrorMessage("Todo ok");
        },
      });
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
            Ingresa los detalles para comenzar a gestionar tu negocio
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
              children={(field) => <field.OrganizationName />}
            />
            <form.AppField
              name="name"
              children={(field) => <field.OrganizationSlug />}
            />
            <FieldGroup className="flex flex-row">
              <form.AppField
                name="address"
                children={(field) => <field.OrganizationAddress />}
              />
              <form.AppField
                name="legalName"
                children={(field) => <field.OrganizationLegalName />}
              />
            </FieldGroup>

            <FieldGroup className="flex flex-row items-end">
              <form.AppField
                name="contactEmail"
                children={(field) => <field.OrganizationContactEmail />}
              />
              <form.AppField
                name="contactPhone"
                children={(field) => <field.OrganizationContactPhone />}
              />
            </FieldGroup>

            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-y-5"></CardFooter>
      </Card>
    </main>
  );
}
