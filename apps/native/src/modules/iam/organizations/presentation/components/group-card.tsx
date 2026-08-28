import { MaterialIcons } from "@/modules/shared/components/icons";
import { ActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { formatStatementEs } from "@fludge/utils/permissions/helpers";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";

interface Props {
  group: ActiveOrganization["groups"][number] & {
    tolalMembers: number;
  };
}

export function GroupCard({ group }: Props) {
  const permissions = Object.entries(
    formatStatementEs(group.permissions, {
      translateKeys: true,
    })
  );

  return (
    <PressableFeedback>
      <Card className="gap-y-2">
        <Card.Header className="gap-y-2">
          <View className="w-full flex-row items-start">
            <View className="flex-1 gap-y-1">
              <Card.Title className="line-clamp-1 flex-1">
                {group.name}
              </Card.Title>
              <StatusChip status={group.status} />
            </View>
            <Button isIconOnly variant="ghost">
              <MaterialIcons
                name="more-vert"
                size={24}
                className="text-accent"
              />
            </Button>
          </View>

          <Card.Description>{group.description}</Card.Description>
        </Card.Header>
        <Card.Body className="flex-row flex-wrap gap-2">
          {permissions.slice(0, 3).map(([key, value]) => (
            <Chip key={key} variant="secondary">
              <Chip.Label>
                {key}: {value}
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
              {group.tolalMembers}
            </Typography>
          </View>
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
