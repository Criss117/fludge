import { GroupsTable } from "@/core/business/presentation/components/groups-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { GroupSummary } from "@repo/core/entities/group";

interface Props {
  businessId: string;
  groups: GroupSummary[];
}

export function EmployeeGroupsTable({ groups, businessId }: Props) {
  return (
    <Card>
      <GroupsTable.Root data={groups} businessId={businessId}>
        <CardHeader>
          <CardTitle>Grupos</CardTitle>
          <CardDescription>
            {groups.length} {groups.length > 1 ? "grupos" : "grupo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupsTable.Content>
            <GroupsTable.Header />
            <GroupsTable.Body />
          </GroupsTable.Content>
        </CardContent>
      </GroupsTable.Root>
    </Card>
  );
}
