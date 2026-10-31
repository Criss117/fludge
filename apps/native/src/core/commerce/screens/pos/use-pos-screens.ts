import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import type { AddCatalogTicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { useCallback, useMemo, useState } from "react";

function useAddProductToTicket() {
  const addTicketProduct = useTicketStore((s) => s.addTicketProduct);

  return (product: ProductSummary, presentations: ProductSummary["presentations"]) => {
    const ticketProduct: AddCatalogTicketProduct = {
      type: "catalog",
      name: product.name,
      stock: product.stock,
      minStock: product.minStock,
      allowNegativeStock: product.allowNegativeStock,
      productId: product.id,
      presentations: presentations.map((presentation) => ({
        conversionFactor: presentation.conversionFactor,
        name: presentation.name,
        originalPrice: presentation.priceSale,
        priceSale: presentation.priceSale,
        quantity: 1,
        wholesalePrice: presentation.priceWholesale ?? null,
        presentationId: presentation.id,
      })),
    };

    addTicketProduct(ticketProduct);
  };
}

export function usePOSScreen() {
  const { filters } = useFilters();
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const addToTicket = useAddProductToTicket();

  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } = useFindProducts({
    searchQuery: filters.searchQuery,
    status: filters.status,
    orderBy: filters.orderBy,
  });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectProduct = (product: ProductSummary) => setSelectedProduct(product);
  const removeSelectedProduct = () => setSelectedProduct(null);

  return {
    actions: {
      handleEndReached,
      selectProduct,
      removeSelectedProduct,
      addToTicket,
    },
    texts: {
      noMore: getI18nKey("screens.catalog.products.no_more"),
    },
    state: {
      items,
      hasNextPage,
      isFetchingNextPage,
      isFetching,
      selectedProduct,
    },
  };
}
