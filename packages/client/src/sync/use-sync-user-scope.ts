import { useSuspenseQuery } from "@tanstack/react-query";

import { useAppState } from "../iam/hooks/use-app-state";
import { useContainer } from "../providers/container.provider";

type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

export function useSyncUserScope() {
  const { data } = useAppState();
  const {
    data: { session },
    clearLastLoggedUserId,
  } = useAppState();
  const { catalogContainer, commerceContainer, iamContainer } = useContainer();

  const userId = session?.user.id;

  if (!userId) throw new Error("User not found");

  return useSuspenseQuery({
    queryKey: ["sync", "user_scope", userId],
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async (): Promise<SyncData> => {
      const lastUserId = data.lastLoggedUserId;

      if (!lastUserId || lastUserId === userId)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [, errorClearLocalTickets] =
        await commerceContainer.repositories.localTicketRepository.clearAll();

      if (errorClearLocalTickets)
        return {
          error: errorClearLocalTickets,
          success: false,
          syncedAt: null,
        };

      const [, errorClearSales] = await commerceContainer.repositories.saleRepository.clearAll();

      if (errorClearSales)
        return {
          error: errorClearSales,
          success: false,
          syncedAt: null,
        };

      const [, errorClearCustomers] =
        await commerceContainer.repositories.customerRepository.clearAll();

      if (errorClearCustomers)
        return {
          error: errorClearCustomers,
          success: false,
          syncedAt: null,
        };

      const [, errorClearProducts] =
        await catalogContainer.repositories.productRepository.clearAll();

      if (errorClearProducts)
        return {
          error: errorClearProducts,
          success: false,
          syncedAt: null,
        };

      const [, errorClearCategories] =
        await catalogContainer.repositories.categoryRepository.clearAll();

      if (errorClearCategories)
        return {
          error: errorClearCategories,
          success: false,
          syncedAt: null,
        };

      const [, errorClearGroups] = await iamContainer.repositories.groupRepository.clearAll();

      if (errorClearGroups)
        return {
          error: errorClearGroups,
          success: false,
          syncedAt: null,
        };

      const [, errorClearMembers] = await iamContainer.repositories.memberRepository.clearAll();

      if (errorClearMembers)
        return {
          error: errorClearMembers,
          success: false,
          syncedAt: null,
        };

      const [, errorClearOrganizations] =
        await iamContainer.repositories.organizationRepository.clearAll();

      if (errorClearOrganizations)
        return {
          error: errorClearOrganizations,
          success: false,
          syncedAt: null,
        };

      await clearLastLoggedUserId.mutateAsync();

      return {
        error: null,
        syncedAt: new Date(),
        success: true,
      };
    },
  });
}
