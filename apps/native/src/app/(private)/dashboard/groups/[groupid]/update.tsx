import { UpdateGroupScreen } from "@/modules/iam/organizations/presentation/screens/update-group.screen";
import { type ErrorBoundaryProps, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Button, Text, View } from "react-native";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();

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
        {t("screens.groups.not_found")}
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
