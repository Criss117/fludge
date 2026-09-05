import { FlatList, View } from "react-native";
import {
  MemberCard,
  CARD_HEIGHT,
  MemberCardSkeleton,
} from "@/modules/iam/organizations/presentation/components/member-card";
import { useFindAllMembers } from "@fludge/client/application/iam/queries/use-find-members";
import { FloatingLink } from "@/modules/shared/components/floating-link";
import { DEFAULT_CARD_PADDING } from "@/modules/shared/utils/constanst";
import {
  SearchInput,
  SearchInputSkeleton,
} from "@/modules/shared/components/search-input";
import { useState } from "react";

const ITEM_SEPARATOR_HEIGHT = 16;

export function MembersScreen() {
  const [query, setQuery] = useState("");
  const { data: members } = useFindAllMembers();

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="helpers.placeholder.search_members"
      />
      <FlatList
        data={members}
        className="flex-1"
        contentContainerClassName="pb-40"
        renderItem={({ item }) => <MemberCard member={item} />}
        keyExtractor={(d) => d.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT + DEFAULT_CARD_PADDING * 2,
          offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
          index,
        })}
      />
      <View className="absolute right-0 bottom-20 px-3">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/members/register",
          }}
        />
      </View>
    </View>
  );
}

export function MembersScreenSkeleton() {
  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <SearchInputSkeleton placeholder="helpers.placeholder.search_members" />
      <FlatList
        data={Array(10).fill(null)}
        className="flex-1 pb-1"
        renderItem={() => <MemberCardSkeleton />}
        keyExtractor={(_, index) => index.toString()}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT + DEFAULT_CARD_PADDING * 2,
          offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
          index,
        })}
      />
    </View>
  );
}
