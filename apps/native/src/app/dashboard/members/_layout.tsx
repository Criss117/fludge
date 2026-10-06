import { Stack } from "expo-router";

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen name="[memberid]/index" />
      <Stack.Screen name="create" />
    </Stack>
  );
}
