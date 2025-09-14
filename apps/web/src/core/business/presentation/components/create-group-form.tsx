import { createContext, use, useEffect, useId } from "react";
import {
  useCreateBusinessForm,
  type FormType,
} from "@repo/ui/business/hooks/use.create-group-form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { Form } from "@/core/shared/components/ui/form";
import { Button } from "@/core/shared/components/ui/button";
import { useFindAllPermissions } from "@/core/business/application/hooks/use.find-all-permissions";
import { PermissionsTable } from "./permissions-table";
import { useMutateGroups } from "../../application/hooks/use.mutate-groups";
import { useRouter } from "@tanstack/react-router";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";

interface Context {
  form: FormType;
  formId: string;
}

interface RootProps {
  children: React.ReactNode;
  businessId: string;
}

interface NameProps {
  className?: string;
}

interface DescriptionProps {
  className?: string;
}

const CreateGroupContext = createContext<Context | null>(null);

function useCreateGroup() {
  const context = use(CreateGroupContext);

  if (!context) {
    throw new Error(
      "useCreateGroupForm must be used within a CreateGroupFormProvider"
    );
  }

  return context;
}

function Root({ children, businessId }: RootProps) {
  const router = useRouter();
  const form = useCreateBusinessForm();
  const formId = `create-group-form-${useId()}`;
  const { create } = useMutateGroups();

  const onSubmit = form.handleSubmit((data) => {
    create.mutate(
      {
        ...data,
        businessId,
      },
      {
        onSuccess: () => {
          router.navigate({
            to: "/business/$id/groups",
            params: { id: businessId },
          });
        },
      }
    );
  });

  return (
    <CreateGroupContext.Provider
      value={{
        form,
        formId,
      }}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} id={formId}>
          {children}
        </form>
      </Form>
    </CreateGroupContext.Provider>
  );
}

function Name({ className }: NameProps) {
  const { form } = useCreateGroup();

  return (
    <InputForm
      control={form.control}
      name="name"
      label="Nombre del grupo"
      placeholder="Nombre del grupo"
      className={className}
    />
  );
}

function Description({ className }: DescriptionProps) {
  const { form } = useCreateGroup();
  return (
    <TextAreaForm
      control={form.control}
      name="description"
      label="Descripción del grupo"
      placeholder="Descripción del grupo"
      textAreaClassName={className}
    />
  );
}

function Submit() {
  const { formId } = useCreateGroup();

  return (
    <Button type="submit" form={formId}>
      Crear nuevo grupo
    </Button>
  );
}

function SelectPermissions() {
  const { data } = useFindAllPermissions();

  return (
    <PermissionsTable.Root data={data}>
      <SelectPermissionsTable />
    </PermissionsTable.Root>
  );
}

function SelectPermissionsTable() {
  const { table } = PermissionsTable.usePermissionsTable();
  const { form } = useCreateGroup();

  const selectedRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    form.setValue(
      "permissions",
      selectedRows.flatMap((row) => row.original)
    );
  }, [selectedRows.length]);

  return (
    <PermissionsTable.Content>
      <PermissionsTable.Header />
      <PermissionsTable.Body />
    </PermissionsTable.Content>
  );
}

export const CreateGroupForm = {
  useCreateGroup,
  Root,
  Name,
  Submit,
  SelectPermissions,
  Description,
};
