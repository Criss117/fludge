import {
  UpdateGroupScreen,
  UpdateGroupScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/update-group.screen";
import { useFindGroupDetail } from "@fludge/client/application/iam/queries/use-find-groups";
import {
  type ErrorBoundaryProps,
  Redirect,
  useLocalSearchParams,
} from "expo-router";
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

function Screen({ groupid }: { groupid: string }) {
  const { data: group } = useFindGroupDetail(groupid);

  if (!group) return <Redirect href="/(private)/dashboard/(tabs)/iam" />;

  return <UpdateGroupScreen group={group} />;
}

export default function UpdateGroup() {
  const { groupid } = useLocalSearchParams<{ groupid?: string }>();

  if (!groupid) return null;

  return (
    <Suspense fallback={<UpdateGroupScreenSkeleton />}>
      <Screen groupid={groupid} />
    </Suspense>
  );
}
