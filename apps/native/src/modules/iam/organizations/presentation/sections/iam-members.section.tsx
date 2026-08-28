import { FlatList, View } from "react-native";
import {
  MemberCard,
  CARD_HEIGHT,
  MemberCardSkeleton,
} from "@/modules/iam/organizations/presentation/components/member-card";
import { useFindAllMembers } from "@fludge/client/application/iam/organization/queries/use-find-members";

const ITEM_SEPARATOR_HEIGHT = 16;

export function IamMembersSection() {
  const { data: members } = useFindAllMembers();

  return (
    <FlatList
      data={members}
      className="flex-1 pb-1"
      renderItem={({ item }) => <MemberCard member={item} />}
      keyExtractor={(d) => d.id}
      ItemSeparatorComponent={
        <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 96 }}
      getItemLayout={(_, index) => ({
        length: CARD_HEIGHT,
        offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
        index,
      })}
    />
  );
}

export function IamMembersSectionSkeleton() {
  return (
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
        length: CARD_HEIGHT,
        offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
        index,
      })}
    />
  );
}
