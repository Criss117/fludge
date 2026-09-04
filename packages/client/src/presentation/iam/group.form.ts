import {
  groupFormOptions,
  type GroupSchema,
  type OnGroupSubmit,
} from "@fludge/client/application/iam/form/group-form";
import {
  getPermissionsByResource,
  PERMISSIONS,
  type ActionFor,
  type Permission,
  type Resource,
} from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMemo } from "react";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
}

export interface FieldProps<T> {
  children: (props: ChildrenProps<T>) => React.ReactNode;
}

export type PermissionsFieldChildrenProps = ChildrenProps<Permission[]> & {
  isSelected(permission: Permission): boolean;
  togglePermission(permission: Permission): void;
  toggleAllFromResource(resource: Resource): void;
  toggleAll(): void;
  counts: Record<Resource, { selected: number; total: number }>;
};

type PermissionsFieldProps = {
  children: (props: PermissionsFieldChildrenProps) => React.ReactNode;
};

const initialCounts = Object.fromEntries(
  Object.keys(PERMISSIONS).map((resource) => [
    resource as Resource,
    { selected: 0, total: PERMISSIONS[resource as Resource].length },
  ]),
) as Record<
  Resource,
  {
    selected: number;
    total: number;
  }
>;

export function PermissionsField({ children }: PermissionsFieldProps) {
  const field = useFieldContext<Permission[]>();

  const statement = field.store.get().value;

  console.log(initialCounts);

  function isSelected(permission: Permission) {
    return statement.includes(permission);
  }

  function togglePermission(permission: Permission) {
    field.setValue((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      }

      return [...prev, permission];
    });
  }

  function toggleAllFromResource(resource: Resource) {
    const permissions = getPermissionsByResource(resource);

    field.setValue((prev) => {
      const exisiting = prev.filter((p) => {
        const [resourceName] = p.split(":") as [Resource, ActionFor<Resource>];

        return resourceName === resource;
      });

      if (exisiting.length === permissions.length) {
        return prev.filter((p) => !permissions.includes(p));
      }

      return [...new Set([...prev, ...permissions])];
    });
  }

  function toggleAll() {
    if (statement.length === 0) {
      field.setValue(Permissions.fromRecord(PERMISSIONS).values);

      return;
    }

    field.setValue([]);
  }

  const counts = useMemo(() => {
    return statement.reduce((acc, permission) => {
      const [resource] = permission.split(":") as [
        Resource,
        ActionFor<Resource>,
      ];

      acc[resource as Resource].selected++;

      return acc;
    }, structuredClone(initialCounts));
  }, [statement]);

  return children({
    field,
    isSelected,
    togglePermission,
    toggleAllFromResource,
    toggleAll,
    counts,
  });
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { PermissionsField },
  formComponents: {},
});

export function useGroupForm(
  options: OnGroupSubmit,
  defaultValues?: GroupSchema,
) {
  return useAppForm(groupFormOptions(options, defaultValues));
}
