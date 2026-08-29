import {
  groupFormOptions,
  type GroupSchema,
  type OnGroupSubmit,
} from "@fludge/client/application/iam/organization/form/group-form";
import type { AppStatement } from "@fludge/utils/permissions/data";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
  id: string;
  isInvalid: boolean;
}

export interface FieldProps<T> {
  children: (props: ChildrenProps<T>) => React.ReactNode;
}

export function NameField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();

  return children({
    field,
    id: "group-form-name",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

export function DescriptionField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();

  return children({
    field,
    id: "group-form-description",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

export function PermissionsField({ children }: FieldProps<AppStatement>) {
  const field = useFieldContext<AppStatement>();

  return children({
    field,
    id: "group-form-permissions",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { NameField, DescriptionField, PermissionsField },
  formComponents: {},
});

export function useGroupForm(
  options: OnGroupSubmit,
  defaultValues?: GroupSchema,
) {
  return useAppForm(groupFormOptions(options, defaultValues));
}
