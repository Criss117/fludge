import { useMutation } from "@tanstack/react-query";
import type {
  CreateTeamSchema,
  UpdateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import type { Permission } from "@fludge/utils/validators/permission.schemas";

import { useTeamsCollection } from "./use-teams-collection";

export function useMutateTeams() {
  const teamsCollection = useTeamsCollection();

  const create = useMutation({
    mutationKey: ["teams", "create"],
    mutationFn: async (values: CreateTeamSchema) => {
      const tx = teamsCollection.insert({
        id: Math.random().toString(36).substring(2, 9),
        name: values.name,
        permissions: values.permissions,
        description: values.description,
        organizationId: "",
        createdAt: new Date(),
        isPending: true,
        updatedAt: null,
      });

      await tx.isPersisted.promise;
    },
  });

  const update = useMutation({
    mutationKey: ["teams", "update"],
    mutationFn: async (values: UpdateTeamSchema) => {
      const tx = teamsCollection.update(values.id, (draft) => {
        draft.name = values.name || draft.name;
        draft.permissions = values.permissions || draft.permissions;
        draft.description = values.description || draft.description;
        draft.isPending = true;
      });

      await tx.isPersisted.promise;
    },
  });

  const remove = useMutation({
    mutationKey: ["teams", "remove"],
    mutationFn: async (id: string) => {
      const tx = teamsCollection.delete(id);

      await tx.isPersisted.promise;
    },
  });

  const updatePermissions = useMutation({
    mutationKey: ["teams", "update-permissions"],
    mutationFn: async (values: {
      teamId: string;
      permissions: Permission[];
    }) => {
      const tx = teamsCollection.update(values.teamId, (draft) => {
        draft.permissions = values.permissions;
      });

      await tx.isPersisted.promise;
    },
  });

  return {
    create,
    update,
    remove,
    updatePermissions,
  };
}
