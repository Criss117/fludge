import { FlatList, View } from "react-native";
import { GroupCard } from "@/modules/iam/organizations/presentation/components/group-card";
import { useFindAllGroups } from "@fludge/client/application/iam/queries/use-find-groups";
import { FloatingLink } from "@/modules/shared/components/floating-link";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useState } from "react";

const ITEM_SEPARATOR_HEIGHT = 16;

export function GroupsScreen() {
  const [query, setQuery] = useState("");
  const { data: groups } = useFindAllGroups({
    query,
  });

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="helpers.placeholder.search_groups"
      />
      <FlatList
        data={groups}
        className="flex-1"
        renderItem={({ item }) => <GroupCard group={item} />}
        keyExtractor={(d) => d.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-40"
      />
      <View className="absolute right-0 bottom-20 px-3">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/groups/create",
          }}
        />
      </View>
    </View>
  );
}
