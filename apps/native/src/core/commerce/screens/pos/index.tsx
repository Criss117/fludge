import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { TextInput } from "@/core/shared/components/text-input";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { Box, Button, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

function ProductList({ searchQuery }: { searchQuery: string }) {
  const { data } = useFindProducts({
    searchQuery,
    status: "active",
    orderBy: {
      createdAt: "desc",
      stock: "none",
    },
  });

  const items = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data.pages],
  );

  return (
    <FlashList
      data={items}
      numColumns={2}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View>
          <ThemedText>{item.name}</ThemedText>
        </View>
      )}
    />
  );
}

export function POSScreen() {
  const colors = useThemeColor();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalAlignment="center"
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <Box modifiers={[weight(1)]}>
              <TextInput
                onValueChange={setSearchQuery}
                value={searchQuery}
                modifiers={[fillMaxWidth()]}
                iconName="search"
                label="screens.catalog.products.search.label"
                placeholder="screens.catalog.products.search.placeholder"
                withDebounce={400}
              />
            </Box>
            <BarcodeReader setBarcode={setSearchQuery} />
          </Row>
        </Host>
      </View>

      <View style={styles.productListContainer}>
        <ProductList searchQuery={searchQuery} />
      </View>

      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
          >
            <ThemedNativeText color={colors.onPrimary}>Cobrar</ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  header: {
    paddingHorizontal: SPACING.sm,
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  productListContainer: {
    paddingTop: SPACING.md,
    flex: 1,
  },
});
