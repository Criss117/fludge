import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCategoryAction } from "../actions/create-category.action";
import { findManyCategoriesQueryOptions } from "./use.find-many-categories";
import { findOneCategoryQueryOptions } from "./use.find-one-category";
import { deleteManyCategoriesAction } from "../actions/delete-many-categories.action";
import { updateCategoryAction } from "../actions/update-category.action";

type CreateParams = Parameters<typeof createCategoryAction>[number];
type DeleteManyParams = Parameters<typeof deleteManyCategoriesAction>[number];
type UpdateParams = Parameters<typeof updateCategoryAction>[number];

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
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("create-category");
      toast.success("Categoría creada exitosamente", {
        id: "create-category",
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyCategoriesQueryOptions(variables.businessId)
      );

      if (variables.parentId) {
        queryClient.invalidateQueries(
          findOneCategoryQueryOptions(variables.businessId, variables.parentId)
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

  const update = useMutation({
    mutationFn: async (data: UpdateParams) => {
      const res = await updateCategoryAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res.data;
    },
    onMutate: () => {
      toast.loading("Actualizando la categoría", {
        id: "update-category",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("update-category");
      toast.success("Categoría actualizada exitosamente", {
        id: "update-category",
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyCategoriesQueryOptions(variables.businessId)
      );

      queryClient.invalidateQueries(
        findOneCategoryQueryOptions(variables.businessId, variables.categoryId)
      );
    },
    onError: (err) => {
      toast.dismiss("update-category");
      toast.error(err.message || "Error al actualizar la categoría", {
        id: "update-category",
        position: "top-center",
      });
    },
  });

  const deleteMany = useMutation({
    mutationFn: async (data: DeleteManyParams) => {
      const res = await deleteManyCategoriesAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res.data;
    },
    onMutate: () => {
      toast.loading("Eliminando categorías", {
        id: "delete-many-categories",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("delete-many-categories");
      toast.success("Categorías eliminadas exitosamente", {
        id: "delete-many-categories",
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findManyCategoriesQueryOptions(variables.businessId)
      );

      const categoriesToInvalidateOptions = variables.categoriesIds.map((id) =>
        findOneCategoryQueryOptions(variables.businessId, id)
      );

      queryClient.invalidateQueries(...categoriesToInvalidateOptions);
    },
    onError: (err) => {
      toast.dismiss("delete-many-categories");
      toast.error(err.message || "Error al eliminar categorías", {
        id: "delete-many-categories",
        position: "top-center",
      });
    },
  });

  return {
    create,
    update,
    deleteMany,
  };
}
