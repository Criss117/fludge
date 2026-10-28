import { Host, HStack } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";

import { SearchInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";

import type { CustomersHeaderProps } from "./types";

export function CustomersHeader({ searchQuery, onSearchChange }: CustomersHeaderProps) {
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
          <SearchInput
            onValueChange={onSearchChange}
            defaultValue={searchQuery}
            label="screens.customers.search.label"
            placeholder="helpers.placeholder.search_customers"
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
