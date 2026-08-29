import { FlatList, View } from "react-native";
import { GroupCard } from "@/modules/iam/organizations/presentation/components/group-card";
import { useFindAllGroups } from "@fludge/client/application/iam/organization/queries/use-find-groups";

const ITEM_SEPARATOR_HEIGHT = 16;

interface Props {
  query: string;
}

export function IamGroupsSection({ query }: Props) {
  const { data: groups } = useFindAllGroups({ query });

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
