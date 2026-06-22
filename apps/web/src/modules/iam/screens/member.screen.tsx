import { MembersTableSection } from "@/modules/iam/sections/members-table.section";
import { MembersHeaderSection } from "@/modules/iam/sections/members-header.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { MembersFiltersSection } from "../sections/members-filters.section";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
}

export function MemberScreen({ organizationId }: Props) {
  const { can } = useMemberPermissions();

  if (!can("members:view")) {
    return <PermissionDeniedAlert resource="miembros" />;
  }

  return (
    <div className="p-8 space-y-8">
      <MembersHeaderSection
        organizationId={organizationId}
        canCreate={can("members:create")}
      />
      <FiltersProvider>
        <MembersFiltersSection />
        <MembersTableSection organizationId={organizationId} />
      </FiltersProvider>
    </div>
  );
}
