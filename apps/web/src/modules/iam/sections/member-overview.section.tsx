import { Calendar, Hash, ShieldCheck, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { MemberWithGroups } from "@fludge/client/application/iam/hooks/use-find-members";
import { Badge } from "@fludge/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";

interface Props {
  member: MemberWithGroups;
}

export function MemberOverviewSection({ member }: Props) {
  const uniquePermissions = new Set(
    member.groups.flatMap((g) => g.permissions),
  );

  const stats = [
    { title: "Grupos Totales", value: member.groups.length },
    { title: "Permisos Heredados", value: uniquePermissions.size },
    { title: "Asignado Por", value: member.assignedBy?.name || "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-x-3">
        <Badge variant="secondary">
          {member.groups.length} grupos
        </Badge>
        <Badge>{uniquePermissions.size} permisos</Badge>
      </div>

      <div className="grid grid-cols-3 gap-x-4">
        {stats.map(({ title, value }) => (
          <Card key={title} className="flex-1">
            <CardHeader>
              <CardTitle className="uppercase text-muted-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-2xl">{value}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-1">
          <Calendar className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Creado el:{" "}
            {format(member.createdAt, "dd MMM yyyy", { locale: es })}
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
        <div className="flex items-center gap-x-1">
          <ShieldCheck className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">{member.role}</p>
        </div>
      </div>
    </div>
  );
}