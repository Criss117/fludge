import { useAuth } from "@fludge/client/providers/auth.provider";
import { Link } from "expo-router";
import { Avatar } from "heroui-native/avatar";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { View } from "react-native";

export function UserButton() {
  const { session } = useAuth();

  const user = session.data?.user!;

  return (
    <View className="px-4">
      <Link href="/(private)/dashboard/settings" push asChild>
        <PressableFeedback>
          <Avatar>
            <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
            {user.image && (
              <Avatar.Image
                source={{
                  uri: user.image,
                }}
              />
            )}
          </Avatar>
        </PressableFeedback>
      </Link>
    </View>
  );
}
