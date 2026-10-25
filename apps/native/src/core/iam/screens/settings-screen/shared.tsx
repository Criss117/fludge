import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/core/shared/components/avatar";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

export function SettingsHeader() {
  const {
    data: { session },
  } = useAppState();

  if (!session) return null;

  return (
    <View style={styles.headerContainer}>
      <Avatar name={session.user.name} size={SPACING["4xl"]} />
      <ThemedText variant="h4">{session.user.name}</ThemedText>
      <ThemedText variant="muted">{session.user.email}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
});
