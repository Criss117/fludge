import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateSync() {
  const queryClient = useQueryClient();

  const invalidateIam = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "iam"],
    });
  };

  const invalidateCatalog = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "catalog"],
    });
  };

  const invalidateSync = () => {
    invalidateIam();
    invalidateCatalog();
  };

  return { invalidateIam, invalidateCatalog, invalidateSync };
}
