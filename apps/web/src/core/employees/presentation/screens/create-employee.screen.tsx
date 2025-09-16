import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { PageHeader } from "@/core/shared/components/page-header";
import { CreateEmployeeForm } from "../components/create-employee-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { GroupSummary } from "@repo/core/entities/group";

interface Props {
  businessId: string;
}

interface GroupsFormProps {
  businessId: string;
  groups: GroupSummary[];
}

function GroupsForm({ businessId, groups }: GroupsFormProps) {
  const { form } = CreateEmployeeForm.useCreateEmployee();

  const groupsSelected = form.watch("groupIds");
  const groupsErrors = form.formState.errors.groupIds;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Listado de Grupos (
          {groupsSelected.length > 0 && `${groupsSelected.length}/`}
          {groups.length}){" "}
          <span className="text-muted-foreground text-sm">Opcional</span>
        </CardTitle>
        <CardDescription>
          Los empleados obtendrán los permisos de los grupos que seleccione.
        </CardDescription>
        {groupsErrors && (
          <CardDescription className="text-destructive">
            {groupsErrors.message}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <CreateEmployeeForm.SelectGroups
          businessId={businessId}
          groups={groups}
        />
      </CardContent>
    </Card>
  );
}

export function CreateEmployeeScreen({ businessId }: Props) {
  const { data: business } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <PageHeader title="Nuevo Empleado" />
      <header className="mx-4">
        <h2 className="text-2xl font-semibold">Crear un Empleado</h2>
        <p className="text-muted-foreground text-sm">
          Especifica los datos del nuevo empleado.
        </p>
      </header>
      <CreateEmployeeForm.Root businessId={businessId}>
        <div className="mx-4 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Información del Empleado</CardTitle>
              <CardDescription>
                Especifica los datos del nuevo empleado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <CreateEmployeeForm.FirstName />
              <CreateEmployeeForm.LastName />
              <CreateEmployeeForm.Username />
              <CreateEmployeeForm.Password />
            </CardContent>
          </Card>
          <GroupsForm businessId={businessId} groups={business.groups} />
        </div>
        <footer className="mt-5 mx-4 flex justify-end">
          <CreateEmployeeForm.Submit />
        </footer>
      </CreateEmployeeForm.Root>
    </section>
  );
}
