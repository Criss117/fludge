import { PressableFeedback } from "heroui-native/pressable-feedback";
import { MaterialIcons } from "./icons";
import { useRouter } from "expo-router";

export function BackButton() {
  const router = useRouter();

  if (!router.canGoBack()) return null;

  return (
    <PressableFeedback onPress={() => router.back()} className="pr-4">
      <MaterialIcons name="arrow-back" size={20} className="text-foreground" />
    </PressableFeedback>
  );
}
