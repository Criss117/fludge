import { createContext, use, useId } from "react";
import {
  type FormType,
  useUpdateGroupForm,
} from "@repo/ui/business/hooks/use.update-form.group";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";
import { Button } from "@/core/shared/components/ui/button";
import type { GroupDetail } from "@repo/core/entities/group";
import { useMutateGroups } from "../../application/hooks/use.mutate-groups";

interface Context {
  form: FormType;
  formId: string;
}

interface RootProps {
  children: React.ReactNode;
  group: GroupDetail;
  businessId: string;
  options?: {
    onSuccess?: () => void;
  };
}

interface NameProps {
  className?: string;
}

interface DescriptionProps {
  className?: string;
}

const UpdateGroupFormContext = createContext<Context | null>(null);

function useUpdateGroup() {
  const context = use(UpdateGroupFormContext);

  if (context === null) {
    throw new Error(
      "useUpdateGroupFormContext must be used within a UpdateGroupFormProvider"
    );
  }

  return context;
}

function Root({ children, group, businessId, options }: RootProps) {
  const { update } = useMutateGroups();
  const form = useUpdateGroupForm({
    defaultValues: {
      name: group.name,
      description: group.description ?? undefined,
    },
  });
  const formId = `update-group-form-${useId()}`;

  const onSubmit = form.handleSubmit(async (data) => {
    update.mutate(
      {
        groupId: group.id,
        businessId,
        data,
      },
      {
        onSuccess: options?.onSuccess,
      }
    );
  });

  return (
    <UpdateGroupFormContext.Provider
      value={{
        form,
        formId,
      }}
    >
      <Form {...form}>
        {form.formState.errors.root && (
          <div className="bg-red-200 py-2 border-l-4 border-red-700">
            <p className="text-red-800 font-semibold ml-2">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}
        <form onSubmit={onSubmit} id={formId}>
          {children}
        </form>
      </Form>
    </UpdateGroupFormContext.Provider>
  );
}

function Name({ className }: NameProps) {
  const { form } = useUpdateGroup();

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
  const { form } = useUpdateGroup();
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
  const { formId } = useUpdateGroup();

  return (
    <Button type="submit" form={formId}>
      Guardar Cambios
    </Button>
  );
}

export const UpdateGroupForm = {
  Root,
  useUpdateGroup,
  Name,
  Description,
  Submit,
};
