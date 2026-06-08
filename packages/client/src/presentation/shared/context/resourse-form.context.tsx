import { createContext, useCallback, useContext, useState } from "react";

export interface ResourceFormState<TData> {
  data: TData | null;
  isOpen: boolean;
}

export interface ResourceFormActions<TData> {
  open: (data: TData) => void;
  close: () => void;
}

export type ResourceFormContext<TData> = ResourceFormState<TData> &
  ResourceFormActions<TData>;

export function createResourceFormContext<TData>() {
  const Context = createContext<ResourceFormContext<TData> | null>(null);

  function useResourceForm() {
    const ctx = useContext(Context);
    if (!ctx)
      throw new Error(
        "useResourceForm must be used within a ResourceFormProvider",
      );
    return ctx;
  }

  return { Context, useResourceForm };
}

export function useResourceFormState<TData>() {
  const [state, setState] = useState<ResourceFormState<TData>>({
    data: null,
    isOpen: false,
  });

  const open = useCallback(
    (data: TData) => setState({ data, isOpen: true }),
    [],
  );

  const close = useCallback(
    () => setState((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  return { ...state, open, close };
}
