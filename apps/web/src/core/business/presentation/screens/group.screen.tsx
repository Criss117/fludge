import { useFindOneGroup } from "@/core/business/application/hooks/use.find-one-group";
import { GroupHeaderSection } from "../sections/group-header.section";
import { GroupDataTablesSection } from "../sections/group-data-tables.section";
import {
  PageHeader,
  PageHeaderGroup,
  PageHeaderGroups,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  groupId: string;
  businessId: string;
}

export function GroupScreen({ businessId, groupId }: Props) {
  const { data } = useFindOneGroup(businessId, groupId);

  return (
    <section className="mx-2 space-y-5">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderGroups businessId={businessId} />
        <PageHeaderGroup
          businessId={businessId}
          groupId={groupId}
          groupName={data.name}
          isPage
        />
      </PageHeader>
      <div className="space-y-8">
        <GroupHeaderSection group={data} businessId={businessId} />
        <GroupDataTablesSection group={data} businessId={businessId} />
      </div>
    </section>
  );
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-5">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderGroups businessId={businessId} isPage />
      </PageHeader>
      <UserHasNoPermissionAlert />
    </section>
  );
}
