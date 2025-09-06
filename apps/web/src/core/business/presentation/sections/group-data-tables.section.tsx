import { EmployeesSummaryTable } from "@/core/employees/presentation/components/employees-summary-table";
import { Card, CardContent } from "@/core/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/components/ui/tabs";
import type { GroupDetail } from "@repo/core/entities/group";
import { PermissionsTable } from "../components/permissions-table";

interface Props {
  group: GroupDetail;
}

export function GroupDataTablesSection({ group }: Props) {
  return (
    <div className="mx-2">
      <Tabs defaultValue="employees">
        <TabsList className="min-w-1/4 max-w-1/2">
          <TabsTrigger value="employees" className="flex-1">
            Empleados ({group.users.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1">
            Permisos ({group.permissions.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <Card>
            <CardContent>
              <EmployeesSummaryTable.Root data={group.users} variant="detail">
                <EmployeesSummaryTable.Header />
                <EmployeesSummaryTable.Body />
              </EmployeesSummaryTable.Root>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="permissions">
          <Card>
            <CardContent>
              <PermissionsTable.Root data={group.permissions}>
                <PermissionsTable.Content>
                  <PermissionsTable.Header />
                  <PermissionsTable.Body />
                </PermissionsTable.Content>
              </PermissionsTable.Root>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
