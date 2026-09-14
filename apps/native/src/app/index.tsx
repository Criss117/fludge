import { useAuth } from "@fludge/client/providers/auth.provider";
import { Redirect } from "expo-router";
import { Typography } from "heroui-native/text";
import { Suspense } from "react";
import { View } from "react-native";

function RedirecTo() {
  const { session } = useAuth();
  const isLogged = session.data !== null;

  if (!isLogged) return <Redirect href="/auth/sign-in" />;

  return <Redirect href="/(private)/dashboard/(tabs)" />;
}

export default function Index() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center">
          <Typography>Connecting to the server...</Typography>
        </View>
      }
    >
      <RedirecTo />
    </Suspense>
  );
}
