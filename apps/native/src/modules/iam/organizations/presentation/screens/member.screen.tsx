import { MaterialIcons } from "@/modules/shared/components/icons";
import { Link } from "expo-router";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { ScrollView, View } from "react-native";
import { MemberGroupsSection } from "../sections/member-groups.section";
import type { MemberSummary } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { UserAvatar } from "@/modules/shared/components/user-avatar";

interface Props {
  member: MemberSummary;
}

export function MemberScreen({ member }: Props) {
  return (
    <View className="mt-2 flex-1 px-3">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-y-8 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Card.Header className="flex items-center justify-center">
            <UserAvatar
              name={member.user.name}
              image={member.user.image}
              avatarProps={{
                size: "lg",
              }}
            />
            <Card.Title className="max-w-2/3 text-center text-2xl font-bold text-balance">
              {member.user.name}
            </Card.Title>
            <Card.Description>{member.user.email}</Card.Description>
          </Card.Header>
        </Card>

        <MemberGroupsSection memberId={member.id} />
      </ScrollView>

      <View className="pt-2 pb-4">
        <Link
          href={{
            pathname: "/(private)/dashboard/members/[memberid]/assign-groups",
            params: { memberid: member.id },
          }}
          push
          asChild
        >
          <Button>
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              className="text-eclipse"
            />
            <Button.Label>Asignar Grupos</Button.Label>
          </Button>
        </Link>
      </View>
    </View>
  );
}
