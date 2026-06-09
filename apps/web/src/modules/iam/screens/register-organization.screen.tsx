import { useState } from "react";
import { useRegisterOrganizationFormOptions } from "@fludge/client/application/iam/forms/organization.form";
import { useRegisterOrganizationForm } from "@fludge/client/presentation/iam/forms/organization/web";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import { Button } from "@fludge/ui/components/button";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { Link } from "@tanstack/react-router";

export function RegisterOrganizationScreen() {
  const [serverError, setServerError] = useState<string | null>(null);

  const { formOptions, mutation } = useRegisterOrganizationFormOptions({
    onSuccess: () => {
      window.location.replace("/organization/select");
    },
    onError: (error) => {
      setServerError(
        error instanceof Error ? error.message : "Error creando organización",
      );
    },
  });

  const form = useRegisterOrganizationForm(formOptions);

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registrar Organización</CardTitle>
          <CardDescription>
            Completa los datos de la organización
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <FieldSet>
              <FieldLegend>Información de la Organización</FieldLegend>
              <FieldGroup>
                <form.AppField name="name">
                  {(field) => <field.NameField />}
                </form.AppField>
                <form.AppField name="phone">
                  {(field) => <field.PhoneField />}
                </form.AppField>
                <form.AppField name="legalName">
                  {(field) => <field.LegalNameField />}
                </form.AppField>
                <form.AppField name="taxId">
                  {(field) => <field.TaxIdField />}
                </form.AppField>
                <form.AppField name="address">
                  {(field) => <field.AddressField />}
                </form.AppField>
              </FieldGroup>
            </FieldSet>

            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Registrando..." : "Registrar Organización"}
            </Button>
          </CardContent>
        </form>

        <CardFooter>
          <Button
            nativeButton={false}
            variant="link"
            render={(props) => <Link to="/organization/select" {...props} />}
          >
            Ir a la selección de organización
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function RegisterOrganizationScreenSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-44" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
