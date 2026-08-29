import { MaterialIcons } from "@/modules/shared/components/icons";

import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { useRouter } from "expo-router";
import { GroupsOptions } from "./options";
import type { GroupSummary } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { getPermissionDescription } from "@fludge/utils/permissions/index";

interface Props {
  group: GroupSummary;
  asMemberGroup?: {
    onPress: (groupId: string, close: () => void) => void;
  };
}

export function GroupCard(props: Props) {
  const router = useRouter();

  return (
    <PressableFeedback>
      <GroupCardBase {...props} />
    </PressableFeedback>
  );
}

export function GroupCardBase({ group, asMemberGroup }: Props) {
  const permissions = group.permissions.map((p) => getPermissionDescription(p));

  return (
    <Card className="gap-y-2">
      <Card.Header className="gap-y-2">
        <View className="w-full flex-row items-start">
          <View className="flex-1 gap-y-1">
            <Card.Title className="line-clamp-1 flex-1">
              {group.name}
            </Card.Title>
            <StatusChip status={group.status} />
          </View>
          <GroupsOptions group={group} asMemberGroup={asMemberGroup} />
        </View>

        <Card.Description className="line-clamp-2">
          {group.description}
        </Card.Description>
      </Card.Header>
      <Card.Body className="flex-row flex-wrap gap-2">
        {permissions.slice(0, 3).map((p) => (
          <Chip key={p.es + p.description.es} variant="secondary">
            <Chip.Label>
              {p.es}: {p.description.es}
            </Chip.Label>
          </Chip>
        ))}
        {permissions.length > 3 && (
          <Chip variant="secondary">
            <Chip.Label>{permissions.length - 3} más</Chip.Label>
          </Chip>
        )}
      </Card.Body>

      <Separator />
      <Card.Footer className="flex-row items-center justify-between">
        <View>
          <Typography color="muted" type="body-sm">
            Creado el: {group.createdAt.toLocaleDateString()}
          </Typography>
        </View>
        <View className="flex-row items-center gap-x-1">
          <MaterialIcons name="people" size={20} className="text-muted" />
          <Typography color="muted" type="body-sm">
            {group.members.length}
          </Typography>
        </View>
      </Card.Footer>
    </Card>
  );
}
