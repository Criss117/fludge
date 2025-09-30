import { GroupsHeaderSection } from "@/core/business/presentation/sections/groups-header.section";
import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { GroupsTable } from "@/core/business/presentation/components/groups-table";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";
import {
  PageHeader,
  PageHeaderGroups,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";

interface Props {
  businessId: string;
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderGroups isPage />
      </PageHeader>
      <UserHasNoPermissionAlert />
    </section>
  );
}

export function GroupsScreen({ businessId }: Props) {
  const { data } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <GroupsTable.Root data={data?.groups} businessId={businessId}>
        <PageHeader>
          <PageHeaderHome businessId={businessId} />
          <PageHeaderGroups isPage />
        </PageHeader>
        <div className="mx-4">
          <GroupsHeaderSection
            totalGroups={data?.groups.length || 0}
            businessId={businessId}
          />
        </div>
        <div className="mx-4">
          <GroupsTable.Content>
            <GroupsTable.Header />
            <GroupsTable.Body />
          </GroupsTable.Content>
        </div>
      </GroupsTable.Root>
    </section>
  );
}
