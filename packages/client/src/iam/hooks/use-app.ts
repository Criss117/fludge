import { useContainer } from "@fludge/client/providers/container.provider";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

const QUERY_KEY = ["app"] as const;

export function useApp() {
  const { iamContainer } = useContainer();
  const queryClient = useQueryClient();

  const appQuery = useSuspenseQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return iamContainer.repositories.appRepository.find();
    },
  });

  const setTheme = useMutation({
    mutationKey: ["app", "set-theme"],
    mutationFn: async (values: { theme: "light" | "dark" }) => {
      const newAppData =
        await iamContainer.repositories.appRepository.save(values);

      queryClient.setQueryData(QUERY_KEY, newAppData);
    },
  });

  const setLoggedUser = useMutation({
    mutationKey: ["app", "set-logged-user"],
    mutationFn: async (values: { loggedUserId: string | null }) => {
      const lastLoggedUserId = appQuery.data?.loggedUserId;

      const newAppData = await iamContainer.repositories.appRepository.save({
        loggedUserId: values.loggedUserId,
        lastLoggedUserId,
      });

      queryClient.setQueryData(QUERY_KEY, newAppData);
    },
  });

  const setActiveOrganization = useMutation({
    mutationKey: ["app", "set-active-organization"],
    mutationFn: async (values: { activeOrganizationId: string | null }) => {
      const newAppData =
        await iamContainer.repositories.appRepository.save(values);

      queryClient.setQueryData(QUERY_KEY, newAppData);
    },
  });

  const clearApp = useMutation({
    mutationKey: ["app", "clear"],
    mutationFn: async () => {
      const newAppData = await iamContainer.repositories.appRepository.clear();

      queryClient.setQueryData(QUERY_KEY, newAppData);
    },
  });

  return {
    ...appQuery,
    setTheme,
    setLoggedUser,
    setActiveOrganization,
    clearApp,
  };
}
