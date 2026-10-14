import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { Button, Host } from "@expo/ui/jetpack-compose";
import { toast } from "sonner-native";
export default function DashboardHome() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Button
          onClick={() => {
            toast("Hello");
          }}
        >
          <ThemedNativeText>Hello</ThemedNativeText>
        </Button>
      </Host>
    </ThemedView>
  );
}
