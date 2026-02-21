import { orpc } from "@/integrations/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEmployeesCollection } from "./use-employees-collection";

export function useMutateEmployees() {
  const employeesCollection = useEmployeesCollection();

  const create = useMutation(
    orpc.employees.create.mutationOptions({
      onSuccess: (data) => {
        employeesCollection.utils.writeInsert({
          id: data.id,
          role: data.role,
          createdAt: data.createdAt,
          organizationId: data.organizationId,
          userId: data.user.id,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image || null,
            address: data.user.address,
            cc: data.user.cc,
            phone: data.user.phone || null,
          },
          teams: [],
        });
      },
    }),
  );

  return {
    create,
  };
}
