import { Button, Host } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";

import { Icon } from "../icon";
import type { HomeHeaderActionButtonProps } from "./type";

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

export function HomeHeaderActionButton({ onPress, icon }: HomeHeaderActionButtonProps) {
  return (
    <Host matchContents>
      <Button onPress={onPress}>
        <Icon name={icon} />
      </Button>
    </Host>
  );
}
