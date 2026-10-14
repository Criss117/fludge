import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useMutationToast } from "@/integrations/toast";
import { Button as ButtonNative, Host } from "@expo/ui/jetpack-compose";
import { Button, Text, View } from "react-native";
import { toast } from "sonner-native";

const fetchData = async () => {
  try {
    const data = await new Promise((resolve) =>
      setTimeout(() => resolve("Hello"), 1000),
    );
    return data;
  } catch (error) {
    throw new Error("Failed to fetch data");
  }
};

export default function DashboardHome() {
  const mutationToast = useMutationToast();
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <ButtonNative
          onClick={() => {
            mutationToast.showPending(
              "api_errors.auth.sessions.invalid_credentials",
            );

            fetchData().then((data) => {
              mutationToast.showSuccess(
                "api_errors.auth.sessions.isr_on_update",
              );
            });
          }}
        >
          <ThemedNativeText>Hello</ThemedNativeText>
        </ButtonNative>
      </Host>
    </ThemedView>
  );
}
