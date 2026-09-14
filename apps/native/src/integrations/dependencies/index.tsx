import { ContainerProvider } from "@fludge/client/providers/container.provider";
import { iamContainer } from "./iam.container";

export function DependenciesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContainerProvider iamContainer={iamContainer}>
      {children}
    </ContainerProvider>
  );
}
