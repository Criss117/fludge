import { PageHeader } from "@/core/shared/components/page-header";
import { GroupsHeaderSection } from "@/core/business/presentation/sections/groups-header.section";
import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { GroupsTable } from "@/core/business/presentation/components/groups-table";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
}

export function WithOutPermissionsGroupsScreen() {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader title="Grupos" />
      <UserHasNoPermissionAlert />
    </section>
  );
}

export function GroupsScreen({ businessId }: Props) {
  const { data } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <GroupsTable.Root data={data?.groups} busineesId={businessId}>
        <PageHeader title="Grupos" />
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
