import { useMemo, useState } from "react";
import { Shield, Undo2Icon } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { Separator } from "@/modules/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/modules/shared/components/ui/tooltip";
import {
  actionsEs,
  groupedPermissions,
  type Permission,
} from "@fludge/utils/validators/permission.schemas";
import { UpdatePermissions } from "../components/update-permissions";

interface Props {
  teamId: string;
  permissions: Permission[];
}

export function PermissionsSection({ permissions, teamId }: Props) {
  const [selectedPermissions, setSelectedPermissions] =
    useState<Permission[]>(permissions);

  const hasChanges = useMemo(() => {
    if (permissions.length !== selectedPermissions.length) return true;

    const set1 = new Set(permissions);
    const set2 = new Set(selectedPermissions);

    if (set1.size !== set2.size) return true;

    for (const item of set1) {
      if (!set2.has(item)) return true;
    }

    return false;
  }, [selectedPermissions, permissions]);

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) => {
      const newPermissions = prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission];
      return newPermissions;
    });
  };

  return (
    <Card className="gap-4">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="p-2 rounded-md bg-primary/20">
            <Shield size={28} />
          </div>
          <div>
            <CardTitle>Permisos</CardTitle>
            <CardDescription>
              {permissions.length} permisos asignados
            </CardDescription>
          </div>
        </div>

        <div className="space-x-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!hasChanges}
                  onClick={() => setSelectedPermissions(permissions)}
                >
                  <Undo2Icon />
                </Button>
              }
            />
            <TooltipContent>
              <p>Revertir cambios</p>
            </TooltipContent>
          </Tooltip>

          <UpdatePermissions
            teamId={teamId}
            permissions={selectedPermissions}
            hasChanges={hasChanges}
          />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="h-3">
        <div className="flex w-1/2 ml-auto">
          {Array.from(actionsEs.entries()).map(([key, value]) => (
            <div key={key} className="flex-1 flex items-center justify-center">
              <p>{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardContent>
        {Object.values(groupedPermissions).map((group) => (
          <div key={group.en} className="flex border-b h-20 items-center">
            <div className="flex-1">
              <p className="text-xl font-semibold">{group.es}</p>
              <p className="text-sm to-muted-foreground">{group.desc}</p>
            </div>
            <div className="flex-1 flex">
              {group.values.map((permission) => (
                <div
                  key={permission.en}
                  className="flex-1 flex items-center justify-center"
                >
                  <Checkbox
                    className="size-8 rounded-xl cursor-pointer"
                    checked={selectedPermissions.includes(permission.en)}
                    onCheckedChange={() => togglePermission(permission.en)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
