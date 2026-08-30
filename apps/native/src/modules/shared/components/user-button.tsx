import { useAuth } from "@fludge/client/providers/auth.provider";
import { Link } from "expo-router";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { View } from "react-native";
import { UserAvatar } from "./user-avatar";

export function UserButton() {
  const { session } = useAuth();

  const user = session.data?.user!;

  return (
    <View className="px-4">
      <Link href="/(private)/dashboard/settings" push asChild>
        <PressableFeedback>
          <UserAvatar name={user.name} image={user.image} />
        </PressableFeedback>
      </Link>
    </View>
  );
}
