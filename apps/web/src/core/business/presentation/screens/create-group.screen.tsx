import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";
import { CreateGroupForm } from "../components/create-group-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { useFindAllPermissions } from "../../application/hooks/use.find-all-permissions";
import {
  PageHeader,
  PageHeaderGroups,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";
import { PageHeaderCreateGroup } from "../../../shared/components/page-header-bread-crumb";

interface Props {
  businessId: string;
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderGroups businessId={businessId} />
        <PageHeaderCreateGroup isPage />
      </PageHeader>
      <UserHasNoPermissionAlert />
    </section>
  );
}

function Form() {
  const { form } = CreateGroupForm.useCreateGroup();
  const { data } = useFindAllPermissions();

  const permissionsSelected = form.watch("permissions");
  const premissionsErrors = form.formState.errors.permissions;

  return (
    <div className="mx-4 space-y-5">
      <Card>
        <CardContent>
          <fieldset className="flex gap-x-4">
            <div className="flex-1">
              <CreateGroupForm.Name />
            </div>
            <div className="flex-1">
              <CreateGroupForm.Description className="resize-none" />
            </div>
          </fieldset>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Elije los permisos del grupo (
            {permissionsSelected.length > 0 && `${permissionsSelected.length}/`}
            {data.length})
          </CardTitle>
          <CardDescription>
            Todos los usuarios de este grupo tendrán los permisos que se han
            seleccionado.
          </CardDescription>
          {premissionsErrors && (
            <CardDescription className="text-destructive">
              {premissionsErrors.message}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <CreateGroupForm.SelectPermissions />
        </CardContent>
      </Card>
    </div>
  );
}

export function CreateGroupScreen({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-5 pb-5">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderGroups businessId={businessId} />
        <PageHeaderCreateGroup isPage />
      </PageHeader>
      <header className="mx-4">
        <h2 className="text-2xl font-semibold">Crear Grupo</h2>
        <p className="text-muted-foreground text-sm">
          Los grupos permiten organizar los permisos de los empleados.
        </p>
      </header>
      <CreateGroupForm.Root businessId={businessId}>
        <Form />
        <footer className="mt-5 mx-4 flex justify-end">
          <CreateGroupForm.Submit />
        </footer>
      </CreateGroupForm.Root>
    </section>
  );
}
