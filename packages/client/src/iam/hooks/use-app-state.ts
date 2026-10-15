import { useContainer } from "@fludge/client/providers/container.provider";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { SessionRepository } from "../domain/session.repository";
import { tryCatch } from "@fludge/utils/trycatch";

const QUERY_KEY = ["app"] as const;

export function useAppState() {
  const { isInternetReachable } = useNetwork();
  const { iamContainer } = useContainer();
  const queryClient = useQueryClient();

  const appQuery = useSuspenseQuery({
    refetchOnReconnect: true,
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const [app, err] = await tryCatch(
        iamContainer.repositories.appRepository.find(),
      );

      console.log("Error finding app", err?.cause);

      if (!isInternetReachable) return app;

      try {
        const { data, error } =
          await iamContainer.repositories.sessionRepository.getSession();

        if (error) {
          if (error.status === 401 || error.status === 403) {
            return iamContainer.repositories.appRepository.save({
              session: null,
            });
          }

          return app;
        }

        if (!data)
          return iamContainer.repositories.appRepository.save({
            session: null,
          });

        return iamContainer.repositories.appRepository.save({
          session: {
            createdAt: data.session.createdAt,
            updatedAt: data.session.updatedAt,
            id: data.session.id,
            userId: data.session.userId,
            expiresAt: data.session.expiresAt,
            ipAddress: data.session.ipAddress,
            userAgent: data.session.userAgent,
            user: data.user as typeof data.user & { isRoot: boolean },
          },
        });
      } catch (networkError) {
        // La request nunca completó (sin red, timeout, DNS, etc.)
        return app;
      }
    },
  });

  const setTheme = useMutation({
    mutationKey: ["app", "set-theme"],
    mutationFn: async (values: { theme: "light" | "dark" }) => {
      const appUpdated =
        await iamContainer.repositories.appRepository.save(values);

      queryClient.setQueryData(QUERY_KEY, {
        ...appQuery.data,
        ...appUpdated,
      });
    },
  });

  const switchActiveOrganization = useMutation({
    mutationKey: ["app", "set-active-organization"],
    mutationFn: async (values: { activeOrganizationId: string | null }) => {
      if (values.activeOrganizationId) {
        const organization =
          await iamContainer.repositories.organizationRepository.findOneById(
            values.activeOrganizationId,
          );

        if (!organization) return;
      }

      await iamContainer.repositories.appRepository.save(values);

      appQuery.refetch();
    },
  });

  const clearApp = useMutation({
    mutationKey: ["app", "clear"],
    mutationFn: async () => {
      await iamContainer.repositories.appRepository.clear();

      appQuery.refetch();
    },
  });

  const signUpEmail = useMutation({
    mutationKey: ["signUpEmail"],
    mutationFn: async (
      values: Parameters<SessionRepository["signUpEmail"]>[0],
    ) => {
      const { error } =
        await iamContainer.repositories.sessionRepository.signUpEmail(
          { ...values, isRoot: true } as any,
          {
            query: { disableCookieCache: true },
          },
        );

      if (error) throw new Error(error.message, { cause: error });

      await appQuery.refetch();
    },
  });

  const signInEmail = useMutation({
    mutationKey: ["signInEmail"],
    mutationFn: async (
      values: Parameters<SessionRepository["signInEmail"]>[0],
    ) => {
      const { error } =
        await iamContainer.repositories.sessionRepository.signInEmail(values);

      if (error) throw new Error(error.message, { cause: error });

      await appQuery.refetch();
    },
  });

  const signOut = useMutation({
    mutationKey: ["signOut"],
    mutationFn: async () => {
      const { error } =
        await iamContainer.repositories.sessionRepository.signOut();

      if (error) throw new Error(error.message, { cause: error });

      await iamContainer.repositories.appRepository.save({
        session: null,
      });

      queryClient.clear();
    },
  });

  return {
    ...appQuery,
    setTheme,
    switchActiveOrganization,
    clearApp,
    signUpEmail,
    signInEmail,
    signOut,
  };
}
