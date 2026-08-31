import { MaterialIcons } from "@/modules/shared/components/icons";
import { useRouter } from "expo-router";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

import { StatusChip } from "@/modules/shared/components/status-chip";
import { MemberOptions } from "./options";
import type { MemberSummary } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { UserAvatar } from "@/modules/shared/components/user-avatar";
import { cn } from "heroui-native";
import { Checkbox } from "heroui-native/checkbox";

export interface MemberCardProps {
  member: MemberSummary;
  hideOptions?: boolean;
  asGroupMember?: {
    onPress: (memberId: string, close: () => void) => void;
  };
}

interface SelectableMemberCardProps extends MemberCardProps {
  onPress?: (group: MemberSummary) => void;
  onLongPress?: (group: MemberSummary) => void;
  isSelected?: boolean;
}

export const CARD_HEIGHT = 152;

export function MemberCard(props: MemberCardProps) {
  const isOwner = props.member.role === "owner";

  console.log({ ...props });

  if (isOwner) return <MemberCardBase {...props} />;

  return <MemberCardRedirect {...props} />;
}

export function SelectableMemberCard({
  onLongPress,
  onPress,
  isSelected,
  ...props
}: SelectableMemberCardProps) {
  return (
    <PressableFeedback
      onPress={() => onPress?.(props.member)}
      onLongPress={() => onLongPress?.(props.member)}
    >
      <View
        className={cn(
          "relative rounded-3xl border",
          isSelected ? "border-foreground" : "border-transparent"
        )}
      >
        <Checkbox
          onPress={() => onPress?.(props.member)}
          className="bg-accent absolute top-4 right-4 z-50"
          isSelected={isSelected}
        />
        <MemberCardBase {...props} hideOptions />
      </View>
    </PressableFeedback>
  );
}

export function MemberCardBase({
  member,
  hideOptions,
  asGroupMember,
}: MemberCardProps) {
  const isOwner = member.role === "owner";

  console.log(asGroupMember);

  return (
    <Card className="gap-y-2" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex flex-row gap-x-2">
        <UserAvatar name={member.user.name} image={member.user.image} />
        <View className="flex-1">
          <Card.Title className="line-clamp-1">{member.user.name}</Card.Title>
          <Card.Description>{member.user.email}</Card.Description>
        </View>
        {!isOwner && !hideOptions && (
          <MemberOptions member={member} asGroupMember={asGroupMember} />
        )}
      </Card.Header>
      <Card.Body>
        <View className="flex flex-row gap-x-2">
          {isOwner ? (
            <Chip>
              <MaterialIcons name="verified-user" className="text-eclipse" />
              <Chip.Label>Propietario</Chip.Label>
            </Chip>
          ) : (
            <Chip>
              <MaterialIcons name="person" className="text-eclipse" />
              <Chip.Label>Miembro</Chip.Label>
            </Chip>
          )}
          <StatusChip status={member.status} />
        </View>

        <View className="pt-2">
          <Typography color="muted">
            Unido el: {member.createdAt.toLocaleDateString()}
          </Typography>
        </View>
      </Card.Body>
    </Card>
  );
}

export function MemberCardRedirect(props: MemberCardProps) {
  const router = useRouter();

  return (
    <PressableFeedback
      onPress={() =>
        router.push({
          pathname: "/(private)/dashboard/members/[memberid]",
          params: { memberid: props.member.id },
        })
      }
    >
      <MemberCardBase {...props} />
    </PressableFeedback>
  );
}

export function MemberCardSkeleton() {
  return (
    <Card className="gap-y-2" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex flex-row gap-x-2">
        <UserAvatar name="F" />
        <SkeletonGroup className="flex-1 gap-y-0.5">
          <SkeletonGroup.Item className="h-7 w-3/4 rounded-full" />
          <SkeletonGroup.Item className="h-6 w-1/2 rounded-full" />
        </SkeletonGroup>
      </Card.Header>
      <Card.Body>
        <SkeletonGroup className="flex flex-row gap-x-2" variant="shimmer">
          <SkeletonGroup.Item className="h-7 w-24 rounded-full" />
          <SkeletonGroup.Item className="h-7 w-20 rounded-full" />
        </SkeletonGroup>

        <View className="flex-row items-center gap-x-1 pt-2">
          <Typography color="muted">Unido el: </Typography>
          <Skeleton className="h-6 w-1/2 rounded-full" variant="shimmer" />
        </View>
      </Card.Body>
    </Card>
  );
}
