import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { SearchInput } from "@/modules/shared/components/search-input";
import { View } from "react-native";
import { useState } from "react";
import { TicketSelector } from "../components/ticket-selector";
import { SalesSummary } from "../components/sale-summary";
import { SaleProductsListSection } from "../sections/sale-products-list.section";
import { ProductPresentationSelectorProvider } from "@fludge/client/presentation/sales/product-presentation-selector.provider";
import { ProductPresentationSelector } from "../components/product-presentation-selector";

export function SalesScreen() {
  const [query, setQuery] = useState("");

  return (
    <View className="flex-1 pt-2">
      <View className="flex-1">
        <TicketSelector />
        <View className="flex-row items-center gap-2 px-3 pb-3">
          <View className="flex-1">
            <SearchInput
              query={query}
              setQuery={setQuery}
              placeholder="helpers.placeholder.search_products"
            />
          </View>
          <CameraDialog setBarcode={setQuery} />
        </View>
        <ProductPresentationSelectorProvider>
          <SaleProductsListSection query={query} />
          <ProductPresentationSelector />
        </ProductPresentationSelectorProvider>
      </View>
      <SalesSummary />
    </View>
  );
}
