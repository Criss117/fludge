import {
  ProductsHeaderSection,
  ProductsHeaderSectionSkeleton,
} from "@/modules/catalog/sections/products-header.section";
import {
  ProductsTableSection,
  ProductsTableSectionSkeleton,
} from "@/modules/catalog/sections/products-table.section";
import { ProductsFiltersSection } from "@/modules/catalog/sections/products-filters.section";
import { FiltersProvider } from "@fludge/client/presentation/shared/context/filter.context";
import { PermissionDeniedAlert } from "@/modules/iam/components/permission-denied-alert";
import { useMemberPermissions } from "@fludge/client/application/iam/hooks/use-member-permissions";

interface Props {
  organizationId: string;
}

export function ProductsScreen({ organizationId }: Props) {
  const { can } = useMemberPermissions();

  if (!can("products:view")) {
    return <PermissionDeniedAlert resource="productos" />;
  }

  return (
    <div className="p-8 space-y-8">
      <ProductsHeaderSection
        organizationId={organizationId}
        canCreate={can("products:create")}
      />
      <FiltersProvider>
        <ProductsFiltersSection />
        <ProductsTableSection
          organizationId={organizationId}
          canUpdate={can("products:update")}
          canDelete={can("products:delete")}
        />
      </FiltersProvider>
    </div>
  );
}

export function ProductsScreenSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <ProductsHeaderSectionSkeleton />
      <ProductsTableSectionSkeleton />
    </div>
  );
}