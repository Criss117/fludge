import type {
  LocalCategorySelect,
  LocalProductPresentationSelect,
  LocalProductSelect,
} from "@fludge/db/local-schemas/shared.schema";

export type CatalogLastSyncedAtLocal = {
  product: LocalProductSelect | null;
  productPresentation: LocalProductPresentationSelect | null;
  category: LocalCategorySelect | null;
};

export type CatalogLastSyncedAtQuery = {
  product: Date | null;
  category: Date | null;
  productPresentation: Date | null;
};

export type CatalogSyncAllItems = {
  products: LocalProductSelect[];
  categories: LocalCategorySelect[];
  productPresentations: LocalProductPresentationSelect[];
};
