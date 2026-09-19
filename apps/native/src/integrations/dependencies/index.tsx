import { ContainerProvider } from "@fludge/client/providers/container.provider";
import { iamContainer } from "./iam.container";
import { catalogContainer } from "./catalog.container";
import { salesContainer } from "./sale.container";
import { customerContainer } from "./customer.container";

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
        salesContainer,
        customerContainer,
      }}
    >
      {children}
    </ContainerProvider>
  );
}
