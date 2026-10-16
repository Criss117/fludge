import { useContainer } from "@fludge/client/providers/container.provider";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { defaultSyncState } from "@fludge/db/local-schemas/app.schema";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import type { SessionRepository } from "../domain/session.repository";

const QUERY_KEY = ["app"] as const;

export function useAppState() {
  const { isInternetReachable } = useNetwork();
  const { iamContainer } = useContainer();
  const queryClient = useQueryClient();

  const appQuery = useSuspenseQuery({
    refetchOnReconnect: true,
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const app = await iamContainer.repositories.appRepository.find();

      if (!isInternetReachable) return app;

      try {
        const { data, error } = await iamContainer.repositories.sessionRepository.getSession();

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
      const newApp = await iamContainer.repositories.appRepository.save(values);

      queryClient.setQueryData(QUERY_KEY, newApp);
    },
  });

  const clearLastLoggedUserId = useMutation({
    mutationKey: ["app", "clear-last-logged-user-id"],
    mutationFn: async () => {
      const newApp = await iamContainer.repositories.appRepository.save({
        lastLoggedUserId: null,
      });

      queryClient.setQueryData(QUERY_KEY, newApp);
    },
  });

  const switchActiveOrganization = useMutation({
    mutationKey: ["app", "set-active-organization"],
    mutationFn: async (values: { activeOrganizationId: string | null }) => {
      if (values.activeOrganizationId) {
        const organization = await iamContainer.repositories.organizationRepository.findOneById(
          values.activeOrganizationId,
        );

        if (!organization) return;
      }

      const newApp = await iamContainer.repositories.appRepository.save(values);

      queryClient.setQueryData(QUERY_KEY, newApp);
    },
  });

  const clearApp = useMutation({
    mutationKey: ["app", "clear"],
    mutationFn: async () => {
      const newApp = await iamContainer.repositories.appRepository.clear();

      queryClient.setQueryData(QUERY_KEY, newApp);
    },
  });

  const signUpEmail = useMutation({
    mutationKey: ["signUpEmail"],
    mutationFn: async (values: Parameters<SessionRepository["signUpEmail"]>[0]) => {
      const { error } = await iamContainer.repositories.sessionRepository.signUpEmail(
        { ...values, isRoot: true } as any,
        {
          query: { disableCookieCache: true },
        },
      );

      if (error) throw new Error(error.message, { cause: error });

      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const signInEmail = useMutation({
    mutationKey: ["signInEmail"],
    mutationFn: async (values: Parameters<SessionRepository["signInEmail"]>[0]) => {
      const { error } = await iamContainer.repositories.sessionRepository.signInEmail(values);

      if (error) throw new Error(error.message, { cause: error });

      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const signOut = useMutation({
    mutationKey: ["signOut"],
    mutationFn: async () => {
      const { error } = await iamContainer.repositories.sessionRepository.signOut();

      if (error) throw new Error(error.message, { cause: error });

      await iamContainer.repositories.appRepository.save({
        lastLoggedUserId: appQuery.data.session?.user.id,
        session: null,
        activeOrganizationId: null,
        syncState: defaultSyncState,
      });

      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });

      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== QUERY_KEY[0],
      });
    },
  });

  return {
    ...appQuery,
    setTheme,
    switchActiveOrganization,
    clearLastLoggedUserId,
    clearApp,
    signUpEmail,
    signInEmail,
    signOut,
  };
}
