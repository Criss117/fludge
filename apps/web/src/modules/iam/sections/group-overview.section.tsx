import { Calendar, ClockIcon, Hash, UserIcon } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale/es";

import type { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { Badge } from "@fludge/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";

interface Props {
  group: GroupDetail;
}

export function GroupOverviewSection({ group }: Props) {
  const stats = [
    { title: "Miembros Totales", value: group.members.length },
    { title: "Permisos Asignados", value: group.permissions.length },
    { title: "Creado Por", value: group.createdBy?.name || "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-x-3">
        <h3 className="font-mono text-lg font-semibold">{group.slug}</h3>
        <Badge variant="secondary">{group.members.length} miembros</Badge>
        <Badge>{group.permissions.length} permisos</Badge>
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
            Creado el: {format(group.createdAt, "dd MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-x-1">
          <ClockIcon className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Ultima actualizacion:{" "}
            {formatDistance(group.updatedAt, new Date(), { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-x-1">
          <Hash className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">{group.slug}</p>
        </div>
        <div className="flex items-center gap-x-1">
          <UserIcon className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            {group.createdBy?.name || "—"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground">{group.description || "—"}</p>
      </div>
    </div>
  );
}
