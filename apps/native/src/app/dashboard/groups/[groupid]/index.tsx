import { Host } from "@expo/ui";
import { useFindGroupDetail } from "@fludge/client/iam/queries/use-find-groups";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Suspense } from "react";

import { GroupDetailScreen } from "@/core/iam/screens/group-detail";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { MenuOptions } from "@/core/shared/components/menu-options";

function Screen({ groupid }: { groupid: string }) {
  const { data } = useFindGroupDetail(groupid);
  const router = useRouter();

  if (!data) return <Redirect href="/dashboard/home/iam/groups" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: data.name,
          headerRight: () => (
            <Host style={{ flex: 1 }}>
              <MenuOptions
                items={[
                  {
                    label: "helpers.navigation.update",
                    icon: "edit",
                    action: () =>
                      router.push({
                        pathname: "/dashboard/groups/[groupid]/update",
                        params: { groupid: data.id },
                      }),
                  },
                ]}
              />
            </Host>
          ),
        }}
      />
      <GroupDetailScreen group={data} />
    </>
  );
}

export default function Group() {
  const { groupid } = useLocalSearchParams<{
    groupid?: string;
  }>();

  if (!groupid) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen groupid={groupid} />
    </Suspense>
  );
}
