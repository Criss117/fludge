import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { FlatList, View } from "react-native";
import { GroupCard } from "@/modules/iam/organizations/presentation/components/group-card";
import { useMemo } from "react";

const ITEM_SEPARATOR_HEIGHT = 16;

export function IamGroupsSection() {
  const { data: activeOrganization } = useFindActiveOrganization();

  const groups = useMemo(
    () =>
      activeOrganization.groups.map((g) => {
        const tolalMembers = activeOrganization.groupMembers.filter(
          (gm) => gm.groupId === g.id
        ).length;

        return { ...g, tolalMembers };
      }),
    [activeOrganization.groups]
  );

  return (
    <FlatList
      data={groups}
      className="flex-1 pb-1"
      renderItem={({ item }) => <GroupCard group={item} />}
      keyExtractor={(d) => d.id}
      ItemSeparatorComponent={
        <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 96 }}
    />
  );
}
