import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { Button, Host } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SalesScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Button onClick={() => router.push("/dashboard/pos")}>
          <ThemedNativeText>Nueva venta</ThemedNativeText>
        </Button>
      </Host>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
