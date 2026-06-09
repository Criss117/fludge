import { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { GroupHeaderSection } from "@/modules/iam/sections/group-header.section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@fludge/ui/components/tabs";
import { Card, CardContent } from "@fludge/ui/components/card";
import { GroupOverviewSection } from "@/modules/iam/sections/group-overview.section";
import { GroupMembersSection } from "@/modules/iam/sections/group-members.section";
import { GroupPermissionsSection } from "@/modules/iam/sections/group-permissions.section";

interface Props {
  organizationId: string;
  group: GroupDetail;
}

export function GroupScreen({ organizationId, group }: Props) {
  return (
    <main className="p-8 space-y-8">
      <GroupHeaderSection group={group} organizationId={organizationId} />
      <Tabs defaultValue="overview">
        <TabsList className="w-1/2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
        </TabsList>
        <Card>
          <CardContent>
            <TabsContent value="overview">
              <GroupOverviewSection group={group} />
            </TabsContent>
            <TabsContent value="members">
              <GroupMembersSection group={group} />
            </TabsContent>
            <TabsContent value="permissions">
              <GroupPermissionsSection group={group} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
}
