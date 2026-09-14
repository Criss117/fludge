import { ContainerProvider } from "@fludge/client/providers/container.provider";
import { iamContainer } from "./iam.container";
import { catalogContainer } from "./catalog.container";

export function DependenciesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContainerProvider
      containers={{
        iamContainer,
        catalogContainer,
      }}
    >
      {children}
    </ContainerProvider>
  );
}
