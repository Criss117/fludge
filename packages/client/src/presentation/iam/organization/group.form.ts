import {
  groupFormOptions,
  type GroupSchema,
  type OnGroupSubmit,
} from "@fludge/client/application/iam/organization/form/group-form";
import { PERMISSIONS, type AppStatement } from "@fludge/utils/permissions/data";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { ActionOf, RESOURCES } from "@fludge/utils/permissions/data";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export interface ChildrenProps<T> {
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

function hasAction<K extends keyof AppStatement>(
  statement: AppStatement,
  key: K,
  action: ActionOf<K>,
): boolean {
  return (
    (statement[key] as readonly string[] | undefined)?.includes(action) ?? false
  );
}

function addAction<K extends keyof AppStatement>(
  statement: AppStatement,
  key: K,
  action: ActionOf<K>,
): AppStatement {
  const current = (statement[key] as readonly ActionOf<K>[] | undefined) ?? [];
  if (current.includes(action)) return statement; // ya existe, no dupliques
  return { ...statement, [key]: [...current, action] };
}

function removeAction<K extends keyof AppStatement>(
  statement: AppStatement,
  key: K,
  action: ActionOf<K>,
): AppStatement {
  const current = (statement[key] as readonly ActionOf<K>[] | undefined) ?? [];
  const updated = current.filter((a) => a !== action);

  return {
    ...statement,
    [key]: updated.length > 0 ? updated : undefined, // limpia el array vacío
  };
}

function toggleAction<K extends keyof AppStatement>(
  statement: AppStatement,
  key: K,
  action: ActionOf<K>,
): AppStatement {
  return hasAction(statement, key, action)
    ? removeAction(statement, key, action)
    : addAction(statement, key, action);
}

function getPermissionCount<K extends RESOURCES>(
  statement: AppStatement,
  key: K,
): { selected: number; total: number; unselected: number } {
  const total = PERMISSIONS[key].length;
  const selected = statement[key]?.length ?? 0;
  return { selected, total, unselected: total - selected };
}

function getAllCounts(statement: AppStatement) {
  return (Object.keys(PERMISSIONS) as RESOURCES[]).reduce(
    (acc, key) => {
      acc[key] = getPermissionCount(statement, key);
      return acc;
    },
    {} as Record<
      RESOURCES,
      { selected: number; total: number; unselected: number }
    >,
  );
}

function selectAllActions<K extends RESOURCES>(
  statement: AppStatement,
  key: K,
): AppStatement {
  return { ...statement, [key]: [...PERMISSIONS[key]] };
}

function deselectAllActions<K extends RESOURCES>(
  statement: AppStatement,
  key: K,
): AppStatement {
  return { ...statement, [key]: undefined };
}

// Útil para el checkbox "seleccionar todo" con estado indeterminado
function toggleAllActions<K extends RESOURCES>(
  statement: AppStatement,
  key: K,
): AppStatement {
  const { selected, total } = getPermissionCount(statement, key);
  return selected === total
    ? deselectAllActions(statement, key)
    : selectAllActions(statement, key);
}

export type PermissionsFieldChildrenProps = ChildrenProps<AppStatement> & {
  toggle: <K extends keyof AppStatement>(key: K, action: ActionOf<K>) => void;
  check: <K extends keyof AppStatement>(key: K, action: ActionOf<K>) => boolean;
  countFor: <K extends RESOURCES>(
    key: K,
  ) => {
    selected: number;
    total: number;
    unselected: number;
  };
  toggleAll: <K extends RESOURCES>(key: K) => void;
  selectAll: <K extends RESOURCES>(key: K) => void;
  deselectAll: <K extends RESOURCES>(key: K) => void;
  counts: ReturnType<typeof getAllCounts>;
};

type PermissionsFieldProps = {
  children: (props: PermissionsFieldChildrenProps) => React.ReactNode;
};

export function PermissionsField({ children }: PermissionsFieldProps) {
  const field = useFieldContext<AppStatement>();

  const statement = field.store.get().value;

  const toggle = <K extends keyof AppStatement>(
    key: K,
    action: ActionOf<K>,
  ) => {
    field.setValue((prev) => toggleAction(prev, key, action));
  };

  const check = <K extends keyof AppStatement>(key: K, action: ActionOf<K>) =>
    hasAction(statement, key, action);

  const countFor = <K extends RESOURCES>(key: K) =>
    getPermissionCount(statement, key);

  const selectAll = <K extends RESOURCES>(key: K) => {
    field.setValue((prev) => selectAllActions(prev, key));
  };

  const deselectAll = <K extends RESOURCES>(key: K) => {
    field.setValue((prev) => deselectAllActions(prev, key));
  };

  const toggleAll = <K extends RESOURCES>(key: K) => {
    field.setValue((prev) => toggleAllActions(prev, key));
  };

  const counts = getAllCounts(statement);

  return children({
    field,
    id: "group-form-permissions",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
    counts,
    toggle,
    check,
    countFor,
    selectAll,
    deselectAll,
    toggleAll,
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
