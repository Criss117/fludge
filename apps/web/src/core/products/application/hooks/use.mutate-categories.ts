import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoryAction } from "../actions/create-category.action";
import { toast } from "sonner";
import { findManyCategoriesQueryOptions } from "./use.find-many-categories";
import { findOneCategoryQueryOptions } from "./use.find-one-category";

type CreateParams = Parameters<typeof createCategoryAction>[number];

export function useMutateCategories() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: CreateParams) => {
      const res = await createCategoryAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res.data;
    },
    onMutate: () => {
      toast.loading("Creando la categoría", {
        id: "create-category",
      });
    },
    onSuccess: (_, varaibles) => {
      toast.dismiss("create-category");
      toast.success("Categoría creada exitosamente", {
        id: "create-category",
      });

      queryClient.invalidateQueries(
        findManyCategoriesQueryOptions(varaibles.businessId)
      );

      if (varaibles.parentId) {
        queryClient.invalidateQueries(
          findOneCategoryQueryOptions(varaibles.businessId, varaibles.parentId)
        );
      }
    },
    onError: (err) => {
      toast.dismiss("create-category");
      toast.error(err.message || "Error al crear la categoría", {
        id: "create-category",
      });
    },
  });

  return {
    create,
  };
}
