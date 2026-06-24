import {
  CategoriesHeaderSection,
  CategoriesHeaderSectionSkeleton,
} from "@/modules/catalog/sections/categories-header.section";
import {
  CategoriesTableSection,
  CategoriesTableSectionSkeleton,
} from "@/modules/catalog/sections/categories-table.section";
import { CategoriesFiltersSection } from "@/modules/catalog/sections/categories-filters.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
}

export function CategoriesScreen({ organizationId }: Props) {
  const { can } = useMemberPermissions();

  if (!can("categories:view")) {
    return <PermissionDeniedAlert resource="categorías" />;
  }

  return (
    <div className="p-8 space-y-8">
      <CategoriesHeaderSection
        organizationId={organizationId}
        canCreate={can("categories:create")}
      />
      <FiltersProvider>
        <CategoriesFiltersSection />
        <CategoriesTableSection
          organizationId={organizationId}
          canUpdate={can("categories:update")}
          canDelete={can("categories:delete")}
        />
      </FiltersProvider>
    </div>
  );
}

export function CategoriesScreenSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <CategoriesHeaderSectionSkeleton />
      <CategoriesTableSectionSkeleton />
    </div>
  );
}
