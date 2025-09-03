import { PageHeader } from "@/core/shared/components/page-header";
import { GroupsHeaderSection } from "../sections/groups-header.section";
import { useFindOneBusiness } from "../../application/hooks/use.find-one-business";
import { GroupsTable } from "../components/groups-table";

interface Props {
  businessId: string;
}

export function GroupsScreen({ businessId }: Props) {
  const { data } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <GroupsTable.Root data={data?.groups}>
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
