import { StyleSheet, View } from "react-native";

import { SPACING } from "@/lib/sp";

import { ThemedView } from "./themed-view";

interface BaseTabScreenProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function BaseTabScreen({ children, header }: BaseTabScreenProps) {
  return (
    <ThemedView style={styles.container}>
      {header && <View style={styles.headerContainer}>{header}</View>}
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    position: "relative",
    backgroundColor: "transparent",
  },
  headerContainer: {
    paddingHorizontal: SPACING.sm,
    backgroundColor: "transparent",
  },
});
