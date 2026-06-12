import { useGroupMembersCollection } from "@fludge/client/application/iam/hooks/use-group-members-collection";
import { useMutation } from "@tanstack/react-query";

type Params = {
  organizationId: string;
};

export function useMutateGroupMembers({ organizationId }: Params) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const unAssignMembersFromGroup = useMutation({
    mutationKey: ["iam", "un-assign-members-to-group"],
    mutationFn: async (values: { groupId: string; memberIds: string[] }) => {},
  });
}
