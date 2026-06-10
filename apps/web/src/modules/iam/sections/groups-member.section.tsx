import type { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { Avatar, AvatarFallback } from "@fludge/ui/components/avatar";
import { Button } from "@fludge/ui/components/button";
import { getInitials } from "@fludge/utils/initials";

interface Props {
  members: GroupDetail["members"];
  onViewAll: () => void;
}

export function GroupsMemberSection({ members, onViewAll }: Props) {
  const firstMembers = members.slice(0, 5);

  return (
    <div className="space-y-6 h-full">
      <h4 className="text-xl font-semibold">
        Miembros Asignados ({members.length})
      </h4>
      <ul className="space-y-4">
        {firstMembers.map((member) => (
          <li key={member.id} className="flex items-center gap-x-2">
            <Avatar>
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p>{member.user.name}</p>
              <p className="text-sm text-muted">{member.user.email}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={onViewAll} className="w-full">
        Ver todos los miembros
      </Button>
    </div>
  );
}
