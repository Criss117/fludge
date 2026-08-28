import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { FlatList, View } from "react-native";
import { GroupCard } from "@/modules/iam/organizations/presentation/components/group-card";
import { useMemo } from "react";

const ITEM_SEPARATOR_HEIGHT = 16;

interface Props {
  query: string;
}

export function IamGroupsSection({ query }: Props) {
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

  const groupsFiltered = useMemo(() => {
    if (!query) return groups;

    return groups.filter((d) =>
      d.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [groups, query]);

  return (
    <FlatList
      data={groupsFiltered}
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
