import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { useGroupCollection } from "@fludge/client/application/iam/hooks/use-group-collection";
import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { toast } from "@fludge/ui/lib/toast";

const DELETE_GROUP_TOASTS = {
  loading: "Eliminando grupo...",
  success: "Grupo eliminado",
  error: "Error al eliminar grupo",
} as const;

const ACTIVATE_GROUP_TOASTS = {
  loading: "Activando grupo...",
  success: "Grupo activado",
  error: "Error al activar grupo",
} as const;

const DEACTIVATE_GROUP_TOASTS = {
  loading: "Desactivando grupo...",
  success: "Grupo desactivado",
  error: "Error al desactivar grupo",
} as const;

type Params = {
  organizationId: string;
};

export function useGroupActionsMutations({ organizationId }: Params) {
  const { groupCollection } = useGroupCollection(organizationId);
  const { orpc } = useORPC();
  const toastIdRef = useRef<string | number>(undefined);

  const deleteGroup = useMutation({
    mutationKey: ["iam", "group", "delete"],
    mutationFn: async (group: GroupSummary) => {
      const tx = groupCollection.delete(group.id);
      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DELETE_GROUP_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(DELETE_GROUP_TOASTS.success, { id: toastIdRef.current });
    },
    onError: () => {
      toast.error(DELETE_GROUP_TOASTS.error, { id: toastIdRef.current });
    },
  });

  const activateGroup = useMutation({
    mutationKey: ["iam", "group", "activate"],
    mutationFn: async (group: GroupSummary) => {
      await orpc.groups.commands.activate.call({ groupIds: [group.id] });
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(ACTIVATE_GROUP_TOASTS.loading);
    },
    onSuccess: (_data, group) => {
      groupCollection.utils.writeUpdate({
        id: group.id,
        deletedAt: null,
        updatedAt: new Date(),
      });
      toast.success(ACTIVATE_GROUP_TOASTS.success, { id: toastIdRef.current });
    },
    onError: () => {
      toast.error(ACTIVATE_GROUP_TOASTS.error, { id: toastIdRef.current });
    },
  });

  const deactivateGroup = useMutation({
    mutationKey: ["iam", "group", "deactivate"],
    mutationFn: async (group: GroupSummary) => {
      await orpc.groups.commands.deactivate.call({ groupIds: [group.id] });
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DEACTIVATE_GROUP_TOASTS.loading);
    },
    onSuccess: (_data, group) => {
      const now = new Date();
      groupCollection.utils.writeUpdate({
        id: group.id,
        deletedAt: now,
        updatedAt: now,
      });
      toast.success(DEACTIVATE_GROUP_TOASTS.success, { id: toastIdRef.current });
    },
    onError: () => {
      toast.error(DEACTIVATE_GROUP_TOASTS.error, { id: toastIdRef.current });
    },
  });

  return {
    deleteGroup: deleteGroup.mutate,
    activateGroup: activateGroup.mutate,
    deactivateGroup: deactivateGroup.mutate,
  };
}