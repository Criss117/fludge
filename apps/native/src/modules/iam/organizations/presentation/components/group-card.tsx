import { MaterialIcons } from "@/modules/shared/components/icons";
import { ActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { formatStatement } from "@fludge/utils/permissions";

interface Props {
  group: ActiveOrganization["groups"][number] & {
    tolalMembers: number;
  };
}

export const CARD_HEIGHT = 152;

export function GroupCard({ group }: Props) {
  const permissions = formatStatement(group.permissions);

  return (
    <Card className="gap-y-2">
      <Card.Header className="gap-y-2">
        <View className="w-full flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-1 flex-1">
              {group.name}
            </Card.Title>
            {group.status === "active" ? (
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
          <Button isIconOnly variant="ghost">
            <MaterialIcons
              name="more-vert"
              size={24}
              className="dark:text-white"
            />
          </Button>
        </View>

        <Card.Description>{group.description}</Card.Description>
      </Card.Header>
      <Card.Body className="flex-row flex-wrap gap-2">
        {Object.entries(permissions)
          .slice(0, 3)
          .map(([key, value]) => (
            <Chip key={key} variant="secondary">
              <Chip.Label>
                {key}: {value}
              </Chip.Label>
            </Chip>
          ))}
      </Card.Body>
      <Separator />
      <Card.Footer>
        <Typography color="muted" type="body-sm">
          Creado el: {group.createdAt.toLocaleDateString()}
        </Typography>
      </Card.Footer>
    </Card>
  );
}
