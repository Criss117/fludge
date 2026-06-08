import { MembersTableSection } from "@/modules/iam/sections/members-table.section";
import { MembersHeaderSection } from "@/modules/iam/sections/members-header.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { MembersFiltersSection } from "../sections/members-filters.section";

interface Props {
  organizationId: string;
}

export function MemberScreen({ organizationId }: Props) {
  return (
    <div className="p-8 space-y-8">
      <MembersHeaderSection organizationId={organizationId} />
      <FiltersProvider>
        <MembersFiltersSection />
        <MembersTableSection organizationId={organizationId} />
      </FiltersProvider>
    </div>
  );
}
