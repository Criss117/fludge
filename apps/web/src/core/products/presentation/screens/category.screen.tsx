import { useFindOneCategory } from "@/core/products/application/hooks/use.find-one-category";
import { PageHeader } from "@/core/shared/components/page-header";
import { CategoryHeaderSection } from "../sections/category-header.section";
import { SubcategoriesSection } from "../sections/subcategories.section";

interface Props {
  businessId: string;
  categoryId: string;
}

export function CategoryScreen({ businessId, categoryId }: Props) {
  const { data: category } = useFindOneCategory(businessId, categoryId);

  return (
    <section className="mx-2 space-y-6">
      <PageHeader title={category.name} />
      <section className="mx-4">
        <CategoryHeaderSection category={category} />
      </section>
      {!category.parent && (
        <div className="mx-4">
          <SubcategoriesSection
            subcategories={category.subcategories}
            businessId={businessId}
            parentId={category.id}
          />
        </div>
      )}
    </section>
  );
}
