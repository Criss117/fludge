import { useState } from "react";
import { AlertCircleIcon, Plus } from "lucide-react";
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
import { FieldGroup } from "@/modules/shared/components/ui/field";
import { useMutateOrganizations } from "@/modules/organizations/application/hooks/use-mutate-organizations";
import type { AppRouterClient } from "@fludge/api/routers/index";
import { LinkButton } from "@/modules/shared/components/link-button";
import { useRouter } from "@tanstack/react-router";

type Organizations = NonNullable<
  Awaited<ReturnType<AppRouterClient["auth"]["getSession"]>>
>["organizations"];

interface Props {
  organizations: Organizations;
}

const defaultValues: CreateOrganizationSchema = {
  name: "",
  legalName: "",
  address: "",
  contactPhone: "",
  contactEmail: "",
};

export function RegisterOrganizationScreen({ organizations }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { create } = useMutateOrganizations();
  const router = useRouter();

  const form = useRegisterOrganizationForm({
    validators: {
      onChange: createOrganizationSchema,
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      create.mutate(value, {
        onError: (error) => {
          setErrorMessage(error.message);
        },
        onSuccess: ({ slug }) => {
          router.navigate({
            to: "/dashboard/$orgslug",
            params: { orgslug: slug },
          });
        },
      });
    },
  });

  return (
    <main className="mx-auto w-full max-w-2xl min-h-dvh flex items-center justify-center">
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
            <FieldGroup className="flex md:flex-row items-start">
              <form.AppField
                name="address"
                children={(field) => <field.OrganizationAddress />}
              />
              <form.AppField
                name="legalName"
                children={(field) => <field.OrganizationLegalName />}
              />
            </FieldGroup>

            <FieldGroup className="flex md:flex-row items-start">
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
        {organizations.length > 0 && (
          <CardFooter className="flex flex-col gap-y-5">
            <LinkButton
              variant="outline"
              className="gap-2 w-full"
              to="/select-organization"
            >
              <Plus className="size-4" />
              Seleccionar una organización
            </LinkButton>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
