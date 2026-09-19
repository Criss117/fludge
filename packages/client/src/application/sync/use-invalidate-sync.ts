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

  const invalidateSale = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "sale"],
    });
  };

  const invalidateSync = () => {
    invalidateIam();
    invalidateCatalog();
    invalidateCustomer();
    invalidateSale();
  };

  return {
    invalidateIam,
    invalidateCatalog,
    invalidateCustomer,
    invalidateSale,
    invalidateSync,
  };
}
