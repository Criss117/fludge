import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc";
import { useEmployeesCollection } from "@/modules/employees/application/hooks/use-employees-collection";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";

export function useMutateTeams() {
  const employeesCollection = useEmployeesCollection();
  const teamsCollection = useTeamsCollection();

  const assignEmployees = useMutation(
    orpc.teams.assingEmployees.mutationOptions({
      onSuccess: (_, variables) => {
        const team = teamsCollection.get(variables.teamId);

        if (!team) return;

        const employees = Array.from(employeesCollection.entries())
          .filter(([_, employee]) =>
            variables.employeeIds.includes(employee.user.id),
          )
          .flatMap(([_, employee]) => employee);

        teamsCollection.utils.writeUpdate({
          ...team,
          employees: [
            ...team.employees,
            ...employees.flatMap((e) => ({
              id: e.id,
              name: e.user.name,
            })),
          ],
        });

        employeesCollection.utils.writeUpdate(
          employees.map((employee) => ({
            ...employee,
            teams: [
              ...employee.teams,
              {
                id: team.id,
                name: team.name,
              },
            ],
          })),
        );
      },
    }),
  );

  return { assignEmployees };
}
