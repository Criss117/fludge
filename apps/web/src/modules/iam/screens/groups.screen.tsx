import {
  GroupsHeaderSection,
  GroupsHeaderSectionSkeleton,
} from "@/modules/iam/sections/groups-header.section";
import { GroupsTableSection } from "@/modules/iam/sections/groups-table.section";
import { GroupsFiltersSection } from "@/modules/iam/sections/groups-filters.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import {
  UpdateGroup,
  UpdateGroupProvider,
} from "@/modules/iam/components/udpate-group";

interface Props {
  organizationId: string;
}

export function GroupsScreen({ organizationId }: Props) {
  return (
    <div className="p-8 space-y-8">
      <GroupsHeaderSection organizationId={organizationId} />
      <FiltersProvider>
        <GroupsFiltersSection />
        <UpdateGroupProvider>
          <UpdateGroup organizationId={organizationId} />
          <GroupsTableSection organizationId={organizationId} />
        </UpdateGroupProvider>
      </FiltersProvider>
    </div>
  );
}

export function GroupsScreenSkeleton() {
  return (
    <div className="p-8">
      <GroupsHeaderSectionSkeleton />
    </div>
  );
}
