import { ContainerProvider } from "@fludge/client/providers/container.provider";

import { catalogContainer } from "./catalog.container";
import { commerceContainer } from "./commerce.container";
import { iamContainer } from "./iam.container";

export function DependenciesProvider({ children }: { children: React.ReactNode }) {
  return (
    <ContainerProvider
      containers={{
        iamContainer,
        catalogContainer,
        commerceContainer,
      }}
    >
      {children}
    </ContainerProvider>
  );
}
