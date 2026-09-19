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

  const invalidateCustomer = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "customer"],
    });
  };

  const invalidateSync = () => {
    invalidateIam();
    invalidateCatalog();
    invalidateCustomer();
  };

  return {
    invalidateIam,
    invalidateCatalog,
    invalidateCustomer,
    invalidateSync,
  };
}
