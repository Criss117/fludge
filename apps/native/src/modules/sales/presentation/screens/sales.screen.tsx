import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { SearchInput } from "@/modules/shared/components/search-input";
import { View } from "react-native";
import { useCallback, useState } from "react";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { TicketSelector } from "../components/ticket-selector";
import { ProductPresentationsDialog } from "../components/product-presentations-dialog";
import { SalesSummary } from "../components/sale-summary";
import { SaleProductsListSection } from "../sections/sale-products-list.section";

export function SalesScreen() {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null
  );
  const handleProductPress = useCallback(
    (product: ProductSummary) => setSelectedProduct(product),
    []
  );
  const closeProductPresentations = useCallback(
    () => setSelectedProduct(null),
    []
  );

  return (
    <View className="flex-1 pt-2">
      <View className="flex-1 gap-y-3">
        <TicketSelector />
        <View className="flex-row items-center gap-2 px-3">
          <View className="flex-1">
            <SearchInput
              query={query}
              setQuery={setQuery}
              placeholder="helpers.placeholder.search_products"
            />
          </View>
          <CameraDialog setBarcode={setQuery} />
        </View>
        <SaleProductsListSection
          onSelectProduct={handleProductPress}
          query={query}
        />
      </View>
      <SalesSummary />
      <ProductPresentationsDialog
        product={selectedProduct}
        onClose={closeProductPresentations}
      />
    </View>
  );
}
