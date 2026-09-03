import {
  GroupScreen,
  GroupScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/group.screen";
import { useFindGroup } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import {
  type ErrorBoundaryProps,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Button } from "react-native";

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

export default function Group() {
  const { groupid } = useLocalSearchParams<{ groupid: string }>();
  const { data: group } = useFindGroup(groupid);

  return (
    <>
      <Stack.Screen options={{ title: group.name }} />
      <Suspense fallback={<GroupScreenSkeleton />}>
        <GroupScreen group={group} />
      </Suspense>
    </>
  );
}
