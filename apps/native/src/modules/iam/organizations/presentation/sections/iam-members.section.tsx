import { FlatList, View } from "react-native";
import {
  MemberCard,
  CARD_HEIGHT,
  MemberCardSkeleton,
} from "@/modules/iam/organizations/presentation/components/member-card";
import { useFindAllMembers } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { FloatingLink } from "@/modules/shared/components/floating-link";

const ITEM_SEPARATOR_HEIGHT = 16;

interface Props {
  query: string;
}

export function IamMembersSection({ query }: Props) {
  const { data: members } = useFindAllMembers({
    query,
  });

  return (
    <View className="relative flex-1">
      <FlatList
        data={members}
        className="flex-1 pb-1"
        renderItem={({ item }) => <MemberCard member={item} />}
        keyExtractor={(d) => d.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 124 }}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
          index,
        })}
      />
      <View className="absolute right-0 bottom-20">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/members/register",
          }}
        />
      </View>
    </View>
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
