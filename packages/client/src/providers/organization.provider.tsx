import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createContext, use } from "react";
import { useContainer } from "./container.provider";
import { useApp } from "../iam/hooks/use-app";
import type { OrganizationSummary } from "../iam/domain/entities";

const QUERY_KEY = ["iam", "organizations"] as const;

function useGenerateContext() {
  const { iamContainer } = useContainer();
  const queryClient = useQueryClient();
  const { data: appData, setActiveOrganization } = useApp();

  const organizationStorage = useSuspenseQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const data =
        await iamContainer.repositories.organizationRepository.findAll();

      const activeOrganization = appData?.activeOrganizationId
        ? data.find((o) => o.id === appData.activeOrganizationId)
        : null;

      return {
        list: data,
        activeOrganization: activeOrganization ?? null,
      };
    },
  });

  const switchOrganization = useMutation({
    mutationKey: ["iam", "organizations", "switch"],
    mutationFn: async (organizationId: string) => {
      const existingOrganization = organizationStorage.data.list.find(
        (o) => o.id === organizationId,
      );

      if (!existingOrganization) return;

      await setActiveOrganization.mutateAsync({
        activeOrganizationId: existingOrganization.id,
      });

      queryClient.setQueryData(QUERY_KEY, {
        list: organizationStorage.data.list,
        activeOrganization: existingOrganization,
      });
    },
  });

  return {
    organizationStorage,
    switchOrganization,
  };
}

export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEY,
    });
  };

  return { invalidateAll };
}

type Context = {
  organizations: OrganizationSummary[];
  activeOrganization: OrganizationSummary | null;
  switchOrganization: ReturnType<
    typeof useGenerateContext
  >["switchOrganization"];
  hasOrganizations: boolean;
};

const OrganizationContext = createContext<Context | null>(null);

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function OrganizationProvider({ children, fallback }: Props) {
  const { organizationStorage, switchOrganization } = useGenerateContext();

  if (switchOrganization.isPending) return fallback;

  return (
    <OrganizationContext.Provider
      value={{
        organizations: organizationStorage.data.list,
        activeOrganization: organizationStorage.data.activeOrganization,
        switchOrganization,
        hasOrganizations: organizationStorage.data.list.length > 0,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = use(OrganizationContext);
  if (!context)
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  return context;
}
