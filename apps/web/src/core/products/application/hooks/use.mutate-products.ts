import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductAction } from "../actions/create-product.action";
import { findManyProductsQueryOptions } from "./use.find-many-products";
import { updateProductAction } from "../actions/update-product.action";
import { findOneProductQueryOptions } from "./use.find-one-product";
import { deleteProductAction } from "../actions/delete-product.action";

type CreateParams = Parameters<typeof createProductAction>[number];
type UpdateParams = Parameters<typeof updateProductAction>[number];
type DeleteParams = Parameters<typeof deleteProductAction>[number];

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

  const update = useMutation({
    mutationFn: async (data: UpdateParams) => {
      const res = await updateProductAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }
    },
    onMutate: () => {
      toast.loading("Actualizando producto...", {
        id: "update-product",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("update-product");
      toast.success("Producto actualizado correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyProductsQueryOptions({
          businessId: variables.businessId,
        })
      );

      queryClient.invalidateQueries(
        findOneProductQueryOptions({
          businessId: variables.businessId,
          productId: variables.productId,
        })
      );
    },
    onError: (error) => {
      toast.dismiss("update-product");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (meta: DeleteParams) => {
      const res = await deleteProductAction(meta);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }
    },
    onMutate: () => {
      toast.loading("Eliminando producto...", {
        id: "delete-product",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("delete-product");
      toast.success("Producto eliminado correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyProductsQueryOptions({
          businessId: variables.businessId,
        })
      );

      queryClient.removeQueries(
        findOneProductQueryOptions({
          businessId: variables.businessId,
          productId: variables.productId,
        })
      );
    },
    onError: (error) => {
      toast.dismiss("delete-product");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  return {
    create,
    update,
    deleteProduct,
  };
}
