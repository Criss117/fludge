import { MaterialIcons } from "@/modules/shared/components/icons";
import { AllMembers } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

interface Props {
  member: AllMembers[number];
}

export const CARD_HEIGHT = 152;

export function MemberCard({ member }: Props) {
  const isOwner = member.role === "owner";

  return (
    <Card className="gap-y-2" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex flex-row gap-x-2">
        <Avatar>
          <Avatar.Fallback>
            {member.user.name.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <View className="flex-1">
          <Card.Title className="line-clamp-1">{member.user.name}</Card.Title>
          <Card.Description>{member.user.email}</Card.Description>
        </View>
        {!isOwner && (
          <Button isIconOnly variant="ghost">
            <MaterialIcons
              name="more-vert"
              size={24}
              className="dark:text-white"
            />
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        <View className="flex flex-row gap-x-2">
          {isOwner ? (
            <Chip variant="primary">
              <MaterialIcons
                name="verified-user"
                className="text-white dark:text-black"
              />
              <Chip.Label>Propietario</Chip.Label>
            </Chip>
          ) : (
            <Chip variant="secondary">
              <MaterialIcons name="person" className="dark:text-white" />
              <Chip.Label>Miembro</Chip.Label>
            </Chip>
          )}
          {member.status === "active" ? (
            <Chip className="bg-green-500">
              <MaterialIcons
                name="check-circle"
                className="text-white dark:text-black"
              />
              <Chip.Label>Activo</Chip.Label>
            </Chip>
          ) : (
            <Chip variant="secondary">
              <MaterialIcons name="cancel" />
              <Chip.Label>Inactivo</Chip.Label>
            </Chip>
          )}
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

export function MemberCardSkeleton() {
  return (
    <Card className="gap-y-2" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex flex-row gap-x-2">
        <Avatar>
          <Avatar.Fallback>FG</Avatar.Fallback>
        </Avatar>
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
