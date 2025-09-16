import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployeeAction } from "../actions/create-employee.action";
import { toast } from "sonner";
import { findOneBusinessQueryOptions } from "@/core/business/application/hooks/use.find-one-business";
import { findOneGroupQueryOptions } from "@/core/business/application/hooks/use.find-one-group";

type Data = Parameters<typeof createEmployeeAction>[number];

export function useMutateEmployees() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: Data) => {
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

  return {
    create,
  };
}
