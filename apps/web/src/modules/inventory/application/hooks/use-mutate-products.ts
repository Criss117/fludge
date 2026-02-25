import { orpc } from "@/integrations/orpc";
import { useMutation } from "@tanstack/react-query";

export function useMutateProducts() {
  const create = useMutation(orpc.inventory.products.create.mutationOptions());

  return { create };
}
