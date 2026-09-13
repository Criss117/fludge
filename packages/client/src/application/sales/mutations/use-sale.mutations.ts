import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";

export function useCreateSaleMutation() {
  const orpc = useOrpc();
  return useMutation(orpc.sale.commands.create.mutationOptions());
}
