import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import type { NewCatalogTicketItem } from "@fludge/client/application/sales/store/tickets.store";

type CatalogPresentation = ProductSummary["presentations"][number];

export function buildCatalogTicketItem(
  product: ProductSummary,
  presentation: CatalogPresentation,
): NewCatalogTicketItem {
  return {
    kind: "catalog",
    quantity: 1,
    presentation: {
      kind: "catalog",
      id: presentation.id,
      productId: presentation.productId,
      name: presentation.name,
      conversionFactor: presentation.conversionFactor,
      price: presentation.priceSale,
      originalPrice: presentation.priceSale,
      priceWholesale: presentation.priceWholesale ?? undefined,
    },
    product: {
      id: product.id,
      allowNegativeStock: product.allowNegativeStock,
      minStock: product.minStock,
      totalStock: product.stock,
    },
  };
}

export function filterProductPresentations(
  presentations: readonly CatalogPresentation[],
  filterInactive = false,
) {
  return presentations.filter(
    (presentation) => !filterInactive || presentation.status === "active",
  );
}
