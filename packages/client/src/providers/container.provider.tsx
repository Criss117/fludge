import { createContext, use } from "react";
import type { IAMContainer } from "../iam/container";
import type { CatalogContainer } from "../catalog/container";
import type { CommerceContainer } from "../commerce/container";

type Context = {
  iamContainer: IAMContainer;
  catalogContainer: CatalogContainer;
  commerceContainer: CommerceContainer;
};

const ContainerContext = createContext<Context | null>(null);

type Props = {
  children: React.ReactNode;
  containers: Context;
};

export function ContainerProvider({ children, containers }: Props) {
  return (
    <ContainerContext.Provider value={containers}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainer() {
  const context = use(ContainerContext);

  if (!context) throw new Error("Container must be used within a Provider");

  return context;
}
