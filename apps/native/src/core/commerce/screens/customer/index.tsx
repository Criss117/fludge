import { StyleSheet, View } from "react-native";

import { CustomerCard } from "@/core/commerce/components/customer-card";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import type { CustomerScreenProps } from "./types";

export function CustomerScreen({ customer }: CustomerScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <CustomerCard customer={customer} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
  },
});
