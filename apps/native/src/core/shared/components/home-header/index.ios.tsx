import { Button, Host } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";

import { Icon } from "../icon";

export function HomeHeader() {
  const router = useRouter();

  return (
    <Host matchContents>
      <Button onPress={() => router.push("/dashboard/settings")}>
        <Icon name="settings" />
      </Button>
    </Host>
  );
}
