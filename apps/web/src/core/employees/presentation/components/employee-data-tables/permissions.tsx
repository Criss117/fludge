import { PermissionsTable } from "@/core/business/presentation/components/permissions-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { Permission } from "@repo/core/value-objects/permission";

interface Props {
  permissions: Permission[];
}

export function EmployeePermissionsTable({ permissions }: Props) {
  return (
    <Card>
      <PermissionsTable.Root data={permissions} hiddeSelect>
        <CardHeader>
          <CardTitle>Permisos ({permissions.length})</CardTitle>
          <CardDescription>
            Aquí pudes ver los permisos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsTable.Content>
            <PermissionsTable.Header />
            <PermissionsTable.Body />
          </PermissionsTable.Content>
        </CardContent>
      </PermissionsTable.Root>
    </Card>
  );
}
