import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { SearchInput } from "@/modules/shared/components/search-input";
import { View } from "react-native";
import { useRef, useState } from "react";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { TicketSelector } from "../components/ticket-selector";
import { SalesSummary } from "../components/sale-summary";
import { SaleProductsListSection } from "../sections/sale-products-list.section";
import {
  type TicketItemSelectorRef,
  TicketItemSelectorProvider,
} from "@fludge/client/presentation/sales/sale-ticket-item-selector.provider";
import { ProductPresentationSelector } from "../components/product-presentation-selector";

export function SalesScreen() {
  const [query, setQuery] = useState("");
  const ticketItemRef = useRef<TicketItemSelectorRef>(null);

  const handleProductPress = (product: ProductSummary) => {
    ticketItemRef.current?.open(product);
  };

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
      <TicketItemSelectorProvider ref={ticketItemRef}>
        <ProductPresentationSelector />
      </TicketItemSelectorProvider>
    </View>
  );
}
