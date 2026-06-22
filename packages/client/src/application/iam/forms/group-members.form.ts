import { z } from "zod";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useGroupMembersCollection } from "@fludge/client/application/iam/hooks/use-group-members-collection";

export const assingMembersToGroupSchema = z.object({
  memberIds: z.array(
    z.string({
      error: "Id de miembro no válido.",
    }),
  ),
});

export const assignGroupsToMemberSchema = z.object({
  groupIds: z.array(
    z.uuid({
      error: "Id de miembro no válido.",
    }),
  ),
});

export type AssingMembersToGroupFormSchema = z.infer<
  typeof assingMembersToGroupSchema
>;

export type AssignGroupsToMemberFormSchema = z.infer<
  typeof assignGroupsToMemberSchema
>;

type FormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

type AssingMembersToGroupFormParams = FormParams & {
  groupId: string;
};

type AssignGroupsToMemberFormParams = FormParams & {
  memberId: string;
};

export function useAssingMembersToGroupFormOptions({
  groupId,
  organizationId,
  onSuccess,
  onError,
}: AssingMembersToGroupFormParams) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const assignMembersToGroup = useMutation({
    mutationKey: ["iam", "assign-members-to-group"],
    mutationFn: async (values: AssingMembersToGroupFormSchema) => {
      if (!values.memberIds.length) return;

      const now = new Date();

      const tx = groupMembersCollection.insert(
        values.memberIds.map((memberId) => ({
          memberId,
          groupId,
          createdAt: now,
          updatedAt: now,
          assignedBy: null,
        })),
      );

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (e) => {
      onError?.(e);
    },
  });

  return formOptions({
    defaultValues: {
      memberIds: [] as AssingMembersToGroupFormSchema["memberIds"],
    },
    validators: {
      onChange: assingMembersToGroupSchema,
    },
    onSubmit: ({ value, formApi }) => {
      assignMembersToGroup.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}

export function useUnAssingMembersToGroupFormOptions({
  groupId,
  organizationId,
  onSuccess,
  onError,
}: AssingMembersToGroupFormParams) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const unAssignMembersToGroup = useMutation({
    mutationKey: ["iam", "un-assign-members-to-group"],
    mutationFn: async (values: AssingMembersToGroupFormSchema) => {
      if (!values.memberIds.length) return;

      const tx = groupMembersCollection.delete(
        values.memberIds.map(
          (memberId) => `${groupId}-${memberId}` as `${string}-${string}`,
        ),
      );

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (e) => {
      onError?.(e);
    },
  });

  return formOptions({
    defaultValues: {
      memberIds: [] as AssingMembersToGroupFormSchema["memberIds"],
    },
    validators: {
      onChange: assingMembersToGroupSchema,
    },
    onSubmit: ({ value, formApi }) => {
      unAssignMembersToGroup.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}

export function useAssignGroupsToMemberFormOptions({
  memberId,
  organizationId,
  onSuccess,
  onError,
}: AssignGroupsToMemberFormParams) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const assignGroupsToMember = useMutation({
    mutationKey: ["iam", "assign-groups-to-member"],
    mutationFn: async (values: AssignGroupsToMemberFormSchema) => {
      if (!values.groupIds.length) return;

      const now = new Date();

      const tx = groupMembersCollection.insert(
        values.groupIds.map((groupId) => ({
          memberId,
          groupId,
          createdAt: now,
          updatedAt: now,
          assignedBy: null,
        })),
      );

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (e) => {
      onError?.(e);
    },
  });

  return formOptions({
    defaultValues: {
      groupIds: [] as AssignGroupsToMemberFormSchema["groupIds"],
    },
    validators: {
      onChange: assignGroupsToMemberSchema,
    },
    onSubmit: ({ value, formApi }) => {
      assignGroupsToMember.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}

export function useUnAssignGroupsToMemberFormOptions({
  memberId,
  organizationId,
  onSuccess,
  onError,
}: AssignGroupsToMemberFormParams) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const unAssignGroupsToMember = useMutation({
    mutationKey: ["iam", "un-assign-groups-to-member"],
    mutationFn: async (values: AssignGroupsToMemberFormSchema) => {
      if (!values.groupIds.length) return;

      const tx = groupMembersCollection.delete(
        values.groupIds.map(
          (groupId) => `${groupId}-${memberId}` as `${string}-${string}`,
        ),
      );

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (e) => {
      onError?.(e);
    },
  });

  return formOptions({
    defaultValues: {
      groupIds: [] as AssignGroupsToMemberFormSchema["groupIds"],
    },
    validators: {
      onChange: assignGroupsToMemberSchema,
    },
    onSubmit: ({ value, formApi }) => {
      unAssignGroupsToMember.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}
