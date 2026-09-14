import { createContext, use } from "react";
import { generateIamContainer } from "../application/iam/container";

type IAMContainer = ReturnType<typeof generateIamContainer>;

type Context = {
  iamContainer: IAMContainer;
};

const ContainerContext = createContext<Context | null>(null);

type Props = {
  children: React.ReactNode;
  iamContainer: IAMContainer;
};

export function ContainerProvider({ children, iamContainer }: Props) {
  return (
    <ContainerContext.Provider value={{ iamContainer }}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainer() {
  const context = use(ContainerContext);

  if (!context) throw new Error("Container must be used within a Provider");

  return context;
}
