import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindAllMembers() {
  const orpc = useOrpc();

  return useSuspenseQuery(orpc.member.queries.findAll.queryOptions());
}

export type AllMembers = Awaited<ReturnType<typeof useFindAllMembers>>["data"];
