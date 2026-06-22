import { Calendar, Hash, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { MemberWithGroups } from "@fludge/client/application/iam/hooks/use-find-members";
import { Avatar, AvatarFallback } from "@fludge/ui/components/avatar";
import { Badge } from "@fludge/ui/components/badge";
import { getInitials } from "@fludge/utils/initials";
import { AssignGroupsToMember } from "@/modules/iam/components/assign-groups-to-member";

interface Props {
  organizationId: string;
  member: MemberWithGroups;
}

export function MemberHeaderSection({ organizationId, member }: Props) {
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-x-4">
        <Avatar size="lg">
          <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <h2 className="text-4xl font-bold">{member.user.name}</h2>
            <Badge>{member.role}</Badge>
          </div>
          <p className="text-muted-foreground">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-1">
          <Calendar className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Creado el:{" "}
            {format(member.createdAt, "dd MMM yyyy", {
              locale: es,
            })}
          </p>
        </div>
        <div className="flex items-center gap-x-1">
          <Hash className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">{member.id}</p>
        </div>
        <div className="flex items-center gap-x-1">
          <UserIcon className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            {member.assignedBy?.name || "—"}
          </p>
        </div>
        <div className="ml-auto">
          <AssignGroupsToMember
            organizationId={organizationId}
            member={member}
          />
        </div>
      </div>
    </header>
  );
}