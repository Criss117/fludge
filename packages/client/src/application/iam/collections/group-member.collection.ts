import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

export type GroupMemberSummary = Awaited<
  ReturnType<ORPCType["groupsMembers"]["queries"]["findAll"]["call"]>
>[number];

const collectionCache = new Map<string, ReturnType<typeof builder>>();

type AssignMembers =
  | {
      groupId: string;
      memberIds: string[];
    }
  | {
      groupIds: string[];
      memberId: string;
    };

function formatIds(
  ids: {
    groupId: string;
    memberId: string;
  }[],
) {
  const groupIds = new Set(ids.map((m) => m.groupId));

  const memberIds = new Set(ids.map((m) => m.memberId));

  if (groupIds.size === 0 || memberIds.size === 0) throw new Error("Invalid");
  if (groupIds.size > 1 && memberIds.size > 1) throw new Error("Invalid");

  let values: AssignMembers | null = null;

  if (groupIds.size === 1) {
    values = {
      groupId: Array.from(groupIds)[0]!,
      memberIds: Array.from(memberIds),
    };
  }

  if (memberIds.size === 1) {
    values = {
      groupIds: Array.from(groupIds),
      memberId: Array.from(memberIds)[0]!,
    };
  }

  if (!values) throw new Error("Invalid");

  return values;
}

function builder(
  organizationId: string,
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  const groupMemberCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "groups-members"],
      queryFn: async () => {
        const data = await orpc.groupsMembers.queries.findAll.call();

        return data;
      },
      getKey: (item) => `${item.groupId}-${item.memberId}`,
      defaultIndexType: BasicIndex,
      onInsert: async ({ transaction }) => {
        const toInsert = transaction.mutations.map((m) => ({
          groupId: m.modified.groupId,
          memberId: m.modified.memberId,
        }));

        const values = formatIds(toInsert);

        const res =
          await orpc.groupsMembers.commands.assignMembers.call(values);

        groupMemberCollection.utils.writeInsert(res);

        return {
          refretch: true,
        };
      },

      onDelete: async ({ transaction }) => {
        const toDelete = transaction.mutations.map((m) => ({
          groupId: m.original.groupId,
          memberId: m.original.memberId,
        }));

        const values = formatIds(toDelete);

        await orpc.groupsMembers.commands.unassignMembers.call(values);

        groupMemberCollection.utils.writeDelete(
          toDelete.map(
            (m) => `${m.groupId}-${m.memberId}` as `${string}-${string}`,
          ),
        );

        return {
          refretch: true,
        };
      },
    }),
  );

  groupMemberCollection.createIndex((row) => row.groupId);
  groupMemberCollection.createIndex((row) => row.memberId);

  return groupMemberCollection;
}

export function groupMemberCollectionBuilder(
  organizationId: string,
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  if (!collectionCache.has(organizationId)) {
    collectionCache.set(
      organizationId,
      builder(organizationId, queryClient, orpc),
    );
  }
  return collectionCache.get(organizationId)!;
}
