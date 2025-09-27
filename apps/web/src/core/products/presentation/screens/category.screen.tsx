import { useFindOneCategory } from "@/core/products/application/hooks/use.find-one-category";
import { CategoryHeaderSection } from "../sections/category-header.section";
import { SubcategoriesSection } from "../sections/subcategories.section";
import {
  PageHeader,
  PageHeaderCategories,
  PageHeaderCategory,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";

interface Props {
  businessId: string;
  categoryId: string;
}

export function CategoryScreen({ businessId, categoryId }: Props) {
  const { data: category } = useFindOneCategory(businessId, categoryId);

  return (
    <section className="mx-2 space-y-6">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderCategories businessId={businessId} />
        {category.parent === null ? (
          <PageHeaderCategory
            businessId={businessId}
            categoryId={categoryId}
            categoryName={category.name}
            isPage
          />
        ) : (
          <>
            <PageHeaderCategory
              businessId={businessId}
              categoryId={category.parent.id}
              categoryName={category.parent.name}
            />
            <PageHeaderCategory
              businessId={businessId}
              categoryId={category.id}
              categoryName={category.name}
              isPage
            />
          </>
        )}
      </PageHeader>
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
