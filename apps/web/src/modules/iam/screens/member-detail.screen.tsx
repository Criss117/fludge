import { useState } from "react";
import type { MemberWithGroups } from "@fludge/client/application/iam/hooks/use-find-members";
import { MemberHeaderSection } from "@/modules/iam/sections/member-header.section";
import { MemberOverviewSection } from "@/modules/iam/sections/member-overview.section";
import { MemberGroupsTableSection } from "@/modules/iam/sections/member-groups-table.section";
import { GroupsFiltersSection } from "@/modules/iam/sections/groups-filters.section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@fludge/ui/components/tabs";
import { Card, CardContent } from "@fludge/ui/components/card";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
  member: MemberWithGroups;
}

export function MemberDetailScreen({ organizationId, member }: Props) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { can } = useMemberPermissions();

  if (!can("members:view")) {
    return <PermissionDeniedAlert resource="miembros" />;
  }

  return (
    <main className="p-8 space-y-8">
      <MemberHeaderSection
        organizationId={organizationId}
        member={member}
        canAssignGroup={can("members:assign-group")}
      />
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-1/2">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            Grupos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent>
              <MemberOverviewSection member={member} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="groups" className="space-y-4">
          <FiltersProvider>
            <GroupsFiltersSection />
            <MemberGroupsTableSection groups={member.groups} />
          </FiltersProvider>
        </TabsContent>
      </Tabs>
    </main>
  );
}