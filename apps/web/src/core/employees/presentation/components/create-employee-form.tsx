import { createContext, use, useEffect, useId } from "react";
import type { GroupSummary } from "@repo/core/entities/group";
import {
  type FormType,
  useCreateEmployeeForm,
} from "@repo/ui/employees/hooks/use.create-employee-form";
import { Form } from "@/core/shared/components/ui/form";
import { Button } from "@/core/shared/components/ui/button";
import { InputForm } from "@/core/shared/components/form/input-form";
import { GroupsTable } from "@/core/business/presentation/components/groups-table";
import { useMutateEmployees } from "@/core/employees/application/hooks/use.mutate-employees";
import { useRouter } from "@tanstack/react-router";

interface Context {
  form: FormType;
  formId: string;
}

interface RootProps {
  children: React.ReactNode;
  businessId: string;
}

interface SelectGroupsProps {
  groups: GroupSummary[];
  businessId: string;
}

const CreateEmployeeFormContext = createContext<Context | null>(null);

function useCreateEmployee() {
  const context = use(CreateEmployeeFormContext);

  if (!context) {
    throw new Error(
      "useCreateEmployee must be used within a CreateEmployeeFormProvider"
    );
  }

  return context;
}

function Root({ children, businessId }: RootProps) {
  const form = useCreateEmployeeForm();
  const router = useRouter();
  const formId = `create-employee-form-${useId()}`;
  const { create } = useMutateEmployees();

  const onSubmit = form.handleSubmit((data) => {
    create.mutate(
      {
        businessId,
        data,
      },
      {
        onSuccess: () => {
          router.navigate({
            to: "/business/$id/employees",
            params: {
              id: businessId,
            },
          });
        },
        onError: (err) => {
          form.setError("root", {
            message: err.message,
          });
        },
      }
    );
  });

  return (
    <CreateEmployeeFormContext.Provider
      value={{
        form,
        formId,
      }}
    >
      <Form {...form}>
        <form id={formId} onSubmit={onSubmit}>
          {children}
        </form>
      </Form>
    </CreateEmployeeFormContext.Provider>
  );
}

function Submit() {
  const { formId } = useCreateEmployee();

  return (
    <Button type="submit" form={formId}>
      Crear Empleado
    </Button>
  );
}

function Password() {
  const { form } = useCreateEmployee();

  return (
    <InputForm
      label="Contraseña"
      name="password"
      type="password"
      className="flex-1"
      placeholder="**********"
      control={form.control}
      required
    />
  );
}

function Username() {
  const { form } = useCreateEmployee();

  return (
    <InputForm
      control={form.control}
      name="username"
      label="Nombre de usuario"
      placeholder="Nombre de usuario"
      type="text"
      required
    />
  );
}

function FirstName() {
  const { form } = useCreateEmployee();

  return (
    <InputForm
      control={form.control}
      name="firstName"
      label="Nombre"
      placeholder="Nombre"
      required
    />
  );
}

function LastName() {
  const { form } = useCreateEmployee();

  return (
    <InputForm
      control={form.control}
      name="lastName"
      label="Apellido"
      placeholder="Apellido"
      required
    />
  );
}

function SelectGroups({ groups, businessId }: SelectGroupsProps) {
  return (
    <GroupsTable.Root data={groups} businessId={businessId}>
      <SelectGroupsTable />
    </GroupsTable.Root>
  );
}

function SelectGroupsTable() {
  const { table } = GroupsTable.useGroupsTable();
  const { form } = useCreateEmployee();

  const selectedRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    form.setValue(
      "groupIds",
      selectedRows.flatMap((row) => row.original.id)
    );
  }, [selectedRows.length]);

  return (
    <GroupsTable.Content>
      <GroupsTable.Header />
      <GroupsTable.Body />
    </GroupsTable.Content>
  );
}

export const CreateEmployeeForm = {
  useCreateEmployee,
  Root,
  Submit,
  Password,
  Username,
  FirstName,
  LastName,
  SelectGroups,
};
