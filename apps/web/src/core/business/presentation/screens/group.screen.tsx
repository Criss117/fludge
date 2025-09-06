import { useFindOneGroup } from "@/core/business/application/hooks/use.find-one-group";
import { PageHeader } from "@/core/shared/components/page-header";
import { GroupHeaderSection } from "../sections/group-header.section";
import { GroupDataTablesSection } from "../sections/group-data-tables.section";

interface Props {
  groupId: string;
  businessId: string;
}

export function GroupScreen({ businessId, groupId }: Props) {
  const { data } = useFindOneGroup(businessId, groupId);

  return (
    <section className="mx-2 space-y-5">
      <PageHeader title={`Grupo - ${data.name}`} />
      <div className="space-y-8">
        <GroupHeaderSection group={data} />
        <GroupDataTablesSection group={data} />
      </div>
    </section>
  );
}
