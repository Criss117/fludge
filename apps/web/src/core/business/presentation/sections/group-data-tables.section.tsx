import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/components/ui/tabs";
import type { GroupDetail } from "@repo/core/entities/group";
import { PermissionsTable } from "../components/groups-data-tables/permissions";
import { EmployeesTable } from "../components/groups-data-tables/employee";

interface Props {
  group: GroupDetail;
  businessId: string;
}

export function GroupDataTablesSection({ group, businessId }: Props) {
  return (
    <section className="mx-2">
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
          <EmployeesTable group={group} businessId={businessId} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTable group={group} businessId={businessId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
