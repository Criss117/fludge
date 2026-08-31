import { UpdateGroupScreen } from "@/modules/iam/organizations/presentation/screens/update-group.screen";
import { type ErrorBoundaryProps, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { Button, Text, View } from "react-native";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Grupo no encontrado
      </Text>
      <Text style={{ marginBottom: 20 }}>{error.message}</Text>
      <Button title="Reintentar" onPress={retry} />
    </View>
  );
}

export default function UpdateGroup() {
  const { groupid } = useLocalSearchParams<{ groupid: string }>();

  return (
    <Suspense fallback={null}>
      <UpdateGroupScreen groupid={groupid} />
    </Suspense>
  );
}
