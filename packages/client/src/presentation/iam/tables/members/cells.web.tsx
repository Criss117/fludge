import type { MemberSummary } from "@fludge/client/application/iam/hooks/use-find-members";

interface MemberGroupsCellProps {
  groups: MemberSummary["groups"];
}

export function MemberGroupsCell({ groups }: MemberGroupsCellProps) {
  const firstThree = groups.toArray.slice(0, 3);

  const hasMore = groups.size > 3;

  return (
    <div>
      {firstThree.map((group) => (
        <div key={group.id}>{group.name}</div>
      ))}
      {hasMore && <span>...</span>}
    </div>
  );
}
