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

  const invalidateCommerce = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "commerce"],
    });
  };

  const invalidateSync = () => {
    invalidateIam();
    invalidateCatalog();
    invalidateCommerce();
  };

  return {
    invalidateIam,
    invalidateCatalog,
    invalidateCommerce,
    invalidateSync,
  };
}
