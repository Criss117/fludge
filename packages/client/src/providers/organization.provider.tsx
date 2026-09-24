import {
  queryOptions,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createContext, use, useEffect, useState } from "react";
import type { OrganizationRepository } from "../application/iam/domain/organization.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import type { LocalOrganization } from "@fludge/db/local-schemas/shared.schema";

const organizationsKeys = {
  all: ["iam", "organizations"] as const,
};

function findAllOrganizationsOptions(
  organizationRepository: OrganizationRepository,
) {
  return queryOptions({
    queryKey: organizationsKeys.all,
    queryFn: async () => {
      return organizationRepository.findAll();
    },
  });
}

function useGenerateContext(organizationRepository: OrganizationRepository) {
  const organizationsQuery = useSuspenseQuery(
    findAllOrganizationsOptions(organizationRepository),
  );

  return {
    organizations: organizationsQuery,
  };
}

type Context = ReturnType<typeof useGenerateContext> & {
  activeOrganization: LocalOrganization | null;
  switchOrganization: (organizationId: string) => Promise<void>;
};

const OrganizationContext = createContext<Context | null>(null);

type OrganizationData = {
  activeOrganizationId: string | null;
};

export interface IOrganizationStorage {
  save(data: OrganizationData): Promise<void>;
  load(): Promise<OrganizationData | null>;
  clear(): Promise<void>;
}

interface Props {
  children: React.ReactNode;
  organizationRepository: OrganizationRepository;
  organizationStorage: IOrganizationStorage;
  fallback: React.ReactNode;
}

export function OrganizationProvider({
  children,
  organizationRepository,
  organizationStorage,
  fallback,
}: Props) {
  const [isPending, setIsPending] = useState(true);
  const [activeOrganization, setActiveOrganization] =
    useState<LocalOrganization | null>(null);
  const context = useGenerateContext(organizationRepository);

  const switchOrganization = async (organizationId: string) => {
    const existingOrganization = context.organizations.data.find(
      (o) => o.id === organizationId,
    );

    await organizationStorage.save({
      activeOrganizationId: existingOrganization?.id ?? null,
    });

    setActiveOrganization(existingOrganization ?? null);
  };

  useEffect(() => {
    async function handleActiveOrganizationChange() {
      const [saved, errorLoading] = await tryCatch(organizationStorage.load());

      if (errorLoading) return;

      if (!saved?.activeOrganizationId) return;

      await switchOrganization(saved.activeOrganizationId);
    }

    handleActiveOrganizationChange().finally(() => setIsPending(false));
  }, []);

  if (isPending) {
    return fallback;
  }

  return (
    <OrganizationContext.Provider
      value={{ ...context, activeOrganization, switchOrganization }}
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

export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: organizationsKeys.all,
    });
  };

  return { invalidateAll };
}
