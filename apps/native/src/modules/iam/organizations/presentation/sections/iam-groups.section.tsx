import { FlatList, View } from "react-native";
import { GroupCard } from "@/modules/iam/organizations/presentation/components/group-card";
import { useFindAllGroups } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { FloatingLink } from "@/modules/shared/components/floating-link";

const ITEM_SEPARATOR_HEIGHT = 16;

interface Props {
  query: string;
}

export function IamGroupsSection({ query }: Props) {
  const { data: groups } = useFindAllGroups({ query });

  return (
    <View className="relative flex-1">
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
      <View className="absolute right-0 bottom-20">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/groups/create",
          }}
        />
      </View>
    </View>
  );
}
