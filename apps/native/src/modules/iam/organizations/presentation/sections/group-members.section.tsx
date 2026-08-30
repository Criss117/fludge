import {
  type MemberSummary,
  useFindAllMembers,
} from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { MemberCard } from "../components/member-card";

export function GroupMembersSection({ groupId }: { groupId: string }) {
  const [query, setQuery] = useState("");
  const { data: members } = useFindAllMembers({ byGroupId: groupId, query });

  return (
    <View className="flex-1 gap-y-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="Buscar Miembros"
      />
      {members.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <MaterialIcons name="info" size={20} className="text-muted" />
          <Typography.Paragraph color="muted">
            No hay miembros
          </Typography.Paragraph>
        </View>
      ) : (
        <View className="gap-y-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </View>
      )}
    </View>
  );
}
