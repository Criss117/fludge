import { orpc } from "@/integrations/orpc";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "@/integrations/tanstack-query";
import { tryCatch } from "@fludge/utils/try-catch";
import { toast } from "sonner";

export type Team = Awaited<ReturnType<typeof orpc.teams.create.call>> & {
  isPending?: boolean;
};

export const teamsCollection = createCollection(
  queryCollectionOptions<Team>({
    queryKey: ["teams"],
    queryFn: () => {
      return orpc.teams.findMany.call();
    },
    getKey: (item) => item.id,
    queryClient,
    onInsert: async ({ transaction, collection }) => {
      const newItem = transaction.mutations[0].modified;

      const insertedTeam = await orpc.teams.create.call(newItem);

      collection.utils.writeInsert(insertedTeam);

      return { refetch: false };
    },
    syncMode: "on-demand",
  }),
);
