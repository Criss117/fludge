import {
  GroupsHeaderSection,
  GroupsHeaderSectionSkeleton,
} from "@/modules/iam/sections/groups-header.section";
import {
  GroupsTableSection,
  GroupsTableSectionSkeleton,
} from "@/modules/iam/sections/groups-table.section";
import { GroupsFiltersSection } from "@/modules/iam/sections/groups-filters.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import {
  UpdateGroup,
  UpdateGroupProvider,
} from "@/modules/iam/components/update-group";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
}

export function GroupsScreen({ organizationId }: Props) {
  const { can } = useMemberPermissions();

  if (!can("groups:view")) {
    return <PermissionDeniedAlert resource="grupos" />;
  }

  return (
    <div className="p-8 space-y-8">
      <GroupsHeaderSection
        organizationId={organizationId}
        canCreate={can("groups:create")}
      />
      <FiltersProvider>
        <GroupsFiltersSection />
        <UpdateGroupProvider>
          <UpdateGroup organizationId={organizationId} />
          <GroupsTableSection
            organizationId={organizationId}
            canUpdate={can("groups:update")}
            canDelete={can("groups:delete")}
          />
        </UpdateGroupProvider>
      </FiltersProvider>
    </div>
  );
}

export function GroupsScreenSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <GroupsHeaderSectionSkeleton />
      <GroupsTableSectionSkeleton />
    </div>
  );
}
