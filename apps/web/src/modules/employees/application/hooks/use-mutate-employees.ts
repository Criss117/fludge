import { orpc } from "@/integrations/orpc";
import { useMutation } from "@tanstack/react-query";
import { useEmployeesCollection } from "./use-employees-collection";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";

export function useMutateEmployees() {
  const employeesCollection = useEmployeesCollection();
  const teamsCollection = useTeamsCollection();

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

  const assignTeams = useMutation(
    orpc.employees.assignTeams.mutationOptions({
      onSuccess: (_, variables) => {
        const employeeEntrie = Array.from(employeesCollection.entries()).find(
          ([_, employee]) => employee.user.id === variables.userId,
        );

        if (!employeeEntrie) return;

        const employee = employeeEntrie[1];

        const teams = Array.from(teamsCollection.entries())
          .filter(([_, team]) => variables.teamIds.includes(team.id))
          .map(([_, t]) => t);

        employeesCollection.utils.writeUpdate({
          ...employee,
          teams: [
            ...employee.teams,
            ...teams.map((t) => ({
              id: t.id,
              name: t.name,
            })),
          ],
        });

        teamsCollection.utils.writeUpdate(
          teams.map((t) => ({
            ...t,
            employees: [
              ...t.employees,
              {
                id: employee.user.id,
                name: employee.user.name,
              },
            ],
          })),
        );
      },
    }),
  );

  const removeTeams = useMutation(
    orpc.employees.removeTeams.mutationOptions({
      onSuccess: (_, variables) => {
        const employeeEntrie = Array.from(employeesCollection.entries()).find(
          ([_, employee]) => employee.user.id === variables.userId,
        );

        if (!employeeEntrie) return;

        const employee = employeeEntrie[1];

        const teams = Array.from(teamsCollection.entries())
          .filter(([_, team]) => variables.teamIds.includes(team.id))
          .map(([_, t]) => t);

        employeesCollection.utils.writeUpdate({
          ...employee,
          teams: employee.teams.filter(
            (t) => !teams.some((team) => team.id === t.id),
          ),
        });

        teamsCollection.utils.writeUpdate(
          teams.map((t) => ({
            ...t,
            employees: t.employees.filter((e) => e.id !== employee.user.id),
          })),
        );
      },
    }),
  );

  return {
    create,
    assignTeams,
    removeTeams,
  };
}
