import { Host, HStack } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { SearchInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";

import { useProductsHeader } from "./use-products";

export function ProductsHeader() {
  const { actions, state, texts } = useProductsHeader();

  return (
    <View style={styles.headerContainer}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <HStack
          modifiers={[
            frame({
              width: Infinity,
            }),
          ]}
        >
          <BarcodeReader setBarcode={actions.setSearchQuery} />
          <SearchInput
            onValueChange={actions.setSearchQuery}
            label={texts.searchBar.label}
            placeholder={texts.searchBar.placeholder}
            defaultValue={state.filters.searchQuery}
          />
        </HStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
});
