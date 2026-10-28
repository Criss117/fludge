import { Box, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet, View } from "react-native";

import { SearchInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";

import type { CustomersHeaderProps } from "./types";

export function CustomersHeader({ searchQuery, onSearchChange }: CustomersHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
          <Box modifiers={[weight(1)]}>
            <SearchInput
              onValueChange={onSearchChange}
              defaultValue={searchQuery}
              label="screens.customers.search.label"
              placeholder="helpers.placeholder.search_customers"
            />
          </Box>
        </Row>
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
