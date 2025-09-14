import { Suspense, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { translatePermission } from "@repo/ui/utils/translate-permissions";
import type { GroupDetail } from "@repo/core/entities/group";
import type { Permission } from "@repo/core/value-objects/permission";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/components/ui/dialog";
import { PermissionsTable as PermissionsDataTable } from "../permissions-table";
import { Button } from "@/core/shared/components/ui/button";
import { useFindAllPermissions } from "@/core/business/application/hooks/use.find-all-permissions";
import { ScrollArea } from "@/core/shared/components/ui/scroll-area";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import { useMutateGroups } from "@/core/business/application/hooks/use.mutate-groups";

interface Props {
  group: GroupDetail;
  businessId: string;
}

function PermissionsList({ businessId, group }: Props) {
  const [open, setOpen] = useState(false);
  const { update } = useMutateGroups();
  const { data: permissions } = useFindAllPermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const selectPermission = (permission: Permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permission)
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const permissionsToShow = permissions.filter(
    (permission) => !group.permissions.some((p) => p === permission)
  );

  const handleClick = () => {
    update.mutate(
      {
        groupId: group.id,
        businessId,
        data: {
          name: group.name,
          description: group.description ?? undefined,
          permissions: [...group.permissions, ...selectedPermissions],
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full border-2">
          Agregar Permisos
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[700px]">
        <DialogHeader>
          <DialogTitle>Lista de permisos</DialogTitle>
          <DialogDescription>
            Selecciona los permisos que deseas agregar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <ul className="space-y-2">
            {permissionsToShow.map((permission) => (
              <li
                className="border p-4 flex justify-between items-center"
                onClick={() => selectPermission(permission)}
                key={permission}
              >
                <Checkbox
                  onClick={() => selectPermission(permission)}
                  checked={selectedPermissions.includes(permission)}
                />
                <span>{translatePermission(permission).translate}</span>
              </li>
            ))}
            {permissions.length > 0 && !permissionsToShow.length && (
              <p className="text-muted-foreground text-sm">
                El grupo ya tiene todos los permisos
              </p>
            )}
          </ul>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="destructive">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={selectedPermissions.length === 0 || update.isPending}
            onClick={handleClick}
          >
            Agregar ({selectedPermissions.length}) permisos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsTableHeader({ group, businessId }: Props) {
  const { update } = useMutateGroups();
  const { table } = PermissionsDataTable.usePermissionsTable();

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const handleDelete = () => {
    if (selectedRows.length === 0) return;

    update.mutate({
      businessId,
      groupId: group.id,
      data: {
        name: group.name,
        description: group.description ?? undefined,
        permissions: group.permissions.filter(
          (permission) => !selectedRows.includes(permission)
        ),
      },
    });
  };

  return (
    <CardHeader className="flex justify-between">
      <div>
        <CardTitle>Permisos</CardTitle>
        <CardDescription>{group.permissions.length} permisons</CardDescription>
      </div>

      <div className="space-x-2">
        <Button
          variant="destructive"
          disabled={selectedRows.length === 0}
          className="rounded-full"
          onClick={handleDelete}
        >
          Eliminar ({selectedRows.length}) permisos
        </Button>
        <Suspense
          fallback={
            <Button
              variant="outline"
              className="rounded-full border-2"
              disabled
            >
              Agregar Permisos
            </Button>
          }
        >
          <PermissionsList group={group} businessId={businessId} />
        </Suspense>
      </div>
    </CardHeader>
  );
}

export function PermissionsTable({ group, businessId }: Props) {
  return (
    <Card>
      <PermissionsDataTable.Root data={group.permissions}>
        <PermissionsTableHeader group={group} businessId={businessId} />
        <CardContent>
          <PermissionsDataTable.Content>
            <PermissionsDataTable.Header />
            <PermissionsDataTable.Body />
          </PermissionsDataTable.Content>
        </CardContent>
      </PermissionsDataTable.Root>
    </Card>
  );
}
