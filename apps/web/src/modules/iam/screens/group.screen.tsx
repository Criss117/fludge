import { useState } from "react";
import type { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { GroupHeaderSection } from "@/modules/iam/sections/group-header.section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@fludge/ui/components/tabs";
import { Card, CardContent } from "@fludge/ui/components/card";
import { GroupOverviewSection } from "@/modules/iam/sections/group-overview.section";
import { GroupPermissionsSection } from "@/modules/iam/sections/group-permissions.section";
import { MembersTableSection } from "../sections/members-table.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { MembersFiltersSection } from "../sections/members-filters.section";
import { GroupsMemberSection } from "../sections/groups-member.section";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
  group: GroupDetail;
}

export function GroupScreen({ organizationId, group }: Props) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { can } = useMemberPermissions();

  if (!can("groups:view")) {
    return <PermissionDeniedAlert resource="grupos" />;
  }

  return (
    <main className="p-8 space-y-8">
      <GroupHeaderSection
        group={group}
        organizationId={organizationId}
        canUpdate={can("groups:update")}
        canAssignMember={can("groups:assign-member")}
      />
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-1/2">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1">
            Miembros
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent>
              <GroupOverviewSection group={group} />
            </CardContent>
          </Card>
          <div className="flex gap-x-4">
            <Card className="w-4/5">
              <CardContent>
                <GroupPermissionsSection group={group} />
              </CardContent>
            </Card>
            <Card className="w-1/5 h-80">
              <CardContent>
                <GroupsMemberSection
                  members={group.members}
                  onViewAll={() => setSelectedTab("members")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <FiltersProvider>
            <MembersFiltersSection />
            <MembersTableSection
              organizationId={organizationId}
              groupId={group.id}
            />
          </FiltersProvider>
        </TabsContent>
      </Tabs>
    </main>
  );
}
