import { useSuspenseQuery } from "@tanstack/react-query";
import { useContainer } from "../providers/container.provider";
import { tryCatch } from "@fludge/utils/trycatch";
import { useAppState } from "../iam/hooks/use-app-state";

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

      const [, erroDeleting] = await tryCatch(async () => {
        await commerceContainer.repositories.localTicketRepository.clearAll();
        await commerceContainer.repositories.saleRepository.clearAll();
        await commerceContainer.repositories.customerRepository.clearAll();

        await catalogContainer.repositories.productRepository.clearAll();
        await catalogContainer.repositories.categoryRepository.clearAll();

        await iamContainer.repositories.groupRepository.clearAll();
        await iamContainer.repositories.memberRepository.clearAll();
        await iamContainer.repositories.organizationRepository.clearAll();
      });

      if (erroDeleting)
        return {
          error: erroDeleting,
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
