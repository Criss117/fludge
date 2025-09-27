import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductAction } from "../actions/create-product.action";
import { findManyProductsQueryOptions } from "./use.find-many-products";

type CreateParams = Parameters<typeof createProductAction>[number];

export function useMutateProducts() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: CreateParams) => {
      const res = await createProductAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }
    },
    onMutate: () => {
      toast.loading("Creando producto...", {
        id: "create-product",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("create-product");
      toast.success("Producto creado correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyProductsQueryOptions({
          businessId: variables.businessId,
        })
      );
    },
    onError: (error) => {
      toast.dismiss("create-product");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  return {
    create,
  };
}
