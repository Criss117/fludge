import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { Separator } from "@/core/shared/components/ui/separator";
import type { GroupDetail } from "@repo/core/entities/group";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UpdateGroupDialog } from "../components/update-group-dialog";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { Trash2Icon } from "lucide-react";

interface Props {
  group: GroupDetail;
  businessId: string;
}

export function GroupHeaderSection({ group, businessId }: Props) {
  const { userHasPermissions } = usePermissions();

  const canUpdateGroup = userHasPermissions("groups:update");
  const canDeleteGroup = userHasPermissions("groups:delete");

  return (
    <header className="mx-2 space-y-5">
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold text-2xl">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>
      </div>

      <div>
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Aquí podrás ver el resumen de tu grupo
              </CardDescription>
            </div>
            <div className="flex items-center gap-x-2">
              {canDeleteGroup && (
                <Button variant="destructive">
                  <Trash2Icon />
                  Eliminar
                </Button>
              )}
              {canUpdateGroup && (
                <UpdateGroupDialog group={group} businessId={businessId} />
              )}
            </div>
          </CardHeader>
          <CardContent className="flex justify-between h-12 items-center">
            <div className="flex-1 mx-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Nombre del grupo
              </h3>
              <p>{group.name}</p>
            </div>
            <Separator orientation="vertical" />
            <div className="flex-1 mx-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Creado el
              </h3>
              <p>
                {formatDistanceToNow(group.createdAt, {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
            <Separator orientation="vertical" />
            <div className="flex-1 mx-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Empleados asignados
              </h3>
              <p>{group.users.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
