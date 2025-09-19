import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEmployeeAction } from "../actions/create-employee.action";
import { findOneBusinessQueryOptions } from "@/core/business/application/hooks/use.find-one-business";
import { findOneGroupQueryOptions } from "@/core/business/application/hooks/use.find-one-group";
import { assignGroupsToEmployeeAction } from "../actions/assign-groups-to-employee.action";
import { removeGroupsFromEmployeeAction } from "../actions/remove-groups-from-employee.action";

type CreateEmployeePrms = Parameters<typeof createEmployeeAction>[number];
type AssignGroupsToEmployeePrms = Parameters<
  typeof assignGroupsToEmployeeAction
>[number];
type RemoveGroupsFromEmployeeParams = Parameters<
  typeof removeGroupsFromEmployeeAction
>[number];

export function useMutateEmployees() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: CreateEmployeePrms) => {
      const res = await createEmployeeAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res;
    },
    onMutate: () => {
      toast.loading("Creando empleado", {
        id: "create-employee-toast",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("create-employee-toast");
      toast.success("Empleado creado correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findOneBusinessQueryOptions(variables.businessId)
      );

      const groupsToInvalidate = variables.data.groupIds.map((groupId) =>
        findOneGroupQueryOptions(variables.businessId, groupId)
      );

      queryClient.invalidateQueries(...groupsToInvalidate);
    },
    onError: (error) => {
      toast.dismiss("create-employee-toast");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const assignGroups = useMutation({
    mutationFn: async (data: AssignGroupsToEmployeePrms) => {
      const res = await assignGroupsToEmployeeAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res;
    },
    onMutate: () => {
      toast.loading("Asignando grupos a empleado", {
        id: "assign-groups-to-employee-toast",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("assign-groups-to-employee-toast");
      toast.success("Grupos asignados correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findOneBusinessQueryOptions(variables.businessId)
      );

      const groupsToInvalidate = variables.groupIds.map((groupId) => {
        return findOneGroupQueryOptions(variables.businessId, groupId);
      });

      queryClient.invalidateQueries(...groupsToInvalidate);
    },
    onError: (error) => {
      toast.dismiss("assign-groups-to-employee-toast");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const removeGroups = useMutation({
    mutationFn: async (data: RemoveGroupsFromEmployeeParams) => {
      const res = await removeGroupsFromEmployeeAction(data);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res;
    },
    onMutate: () => {
      toast.loading("Eliminando grupos de empleado", {
        id: "remove-groups-from-employee-toast",
        position: "top-center",
      });
    },
    onSuccess: (_, variables) => {
      toast.dismiss("remove-groups-from-employee-toast");
      toast.success("Grupos eliminados correctamente", {
        position: "top-center",
      });

      queryClient.invalidateQueries(
        findOneBusinessQueryOptions(variables.businessId)
      );

      const groupsToInvalidate = variables.groupIds.map((groupId) => {
        return findOneGroupQueryOptions(variables.businessId, groupId);
      });

      queryClient.invalidateQueries(...groupsToInvalidate);
    },
    onError: (error) => {
      toast.dismiss("remove-groups-from-employee-toast");
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  return {
    create,
    assignGroups,
    removeGroups,
  };
}
