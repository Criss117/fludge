import { useMutation } from "@tanstack/react-query";
import type { CreateTeamsMembersSchema } from "@fludge/utils/validators/team.schemas";

import { useTeamsMembersCollection } from "./use-teams-members-collection";

export function useMutateTeamsMembers() {
  const teamsMemberCollection = useTeamsMembersCollection();

  const create = useMutation({
    mutationKey: ["create-team-member"],
    mutationFn: async (values: CreateTeamsMembersSchema) => {
      const tx = teamsMemberCollection.insert(
        values.map((v) => ({
          ...v,
          createdAt: new Date(),
          id: crypto.randomUUID(),
          isPending: true,
        })),
      );

      await tx.isPersisted.promise;
    },
  });

  const remove = useMutation({
    mutationKey: ["create-team-member"],
    mutationFn: async (values: CreateTeamsMembersSchema) => {
      const teamsMemberIds = Array.from(teamsMemberCollection.entries())
        .filter(([, tm]) =>
          values.some((v) => v.teamId === tm.teamId && v.userId === tm.userId),
        )
        .map(([id]) => id);

      const tx = teamsMemberCollection.delete(teamsMemberIds);

      await tx.isPersisted.promise;
    },
  });

  return {
    create,
    remove,
  };
}
