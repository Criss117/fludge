import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createGroupAction } from "../actions/create-group.action";
import { findOneBusinessQueryOptions } from "./use.find-one-business";
import { assignEmployeesToGroupAction } from "../actions/assign-employees-to-group.action";
import { findOneGroupQueryOptions } from "./use.find-one-group";

export function useMutateGroups() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createGroupAction,
    onMutate: () => {
      toast.loading("Creando grupo", {
        id: "toast-loading-create-business",
        position: "top-center",
      });
    },
    onError: () => {
      toast.dismiss("toast-loading-create-business");
      toast.error("Error al crear grupo", {
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("toast-loading-create-business");
      toast.success("Grupo creado exitosamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findOneBusinessQueryOptions(variables.businessId)
      );
    },
  });

  const assignEmployees = useMutation({
    mutationFn: assignEmployeesToGroupAction,
    onMutate: () => {
      toast.loading("Asignando empleados a grupo", {
        id: "toast-loading-assign-employees-to-group",
        position: "top-center",
      });
    },
    onError: () => {
      toast.dismiss("toast-loading-assign-employees-to-group");
      toast.error("Error al asignar empleados a grupo", {
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("toast-loading-assign-employees-to-group");
      toast.success("Empleados asignados exitosamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findOneBusinessQueryOptions(variables.businessId)
      );

      queryClient.invalidateQueries(
        findOneGroupQueryOptions(variables.businessId, variables.groupId)
      );
    },
  });

  return {
    create,
    assignEmployees,
  };
}
