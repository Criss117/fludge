import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { formatStatementEs } from "@fludge/utils/permissions/helpers";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useMemo } from "react";
import { View } from "react-native";

interface Props {
  groups: ActiveOrganization["groups"];
}

export function MemberGroupsSection({ groups }: Props) {
  const formatedGroups = useMemo(() => {
    return groups.map((g) => {
      const permissions = formatStatementEs(g.permissions, {
        translateKeys: true,
      });

      return {
        ...g,
        permissions: Object.entries(permissions),
      };
    });
  }, [groups]);

  return (
    <View className="gap-y-2">
      <View>
        <Typography.Heading type="h2">Grupos</Typography.Heading>
        <Typography.Paragraph color="muted">
          Roles y permisos heredados
        </Typography.Paragraph>
      </View>

      {formatedGroups.map((g) => (
        <PressableFeedback key={g.id}>
          <Card>
            <Card.Header className="flex flex-row items-start justify-between">
              <View className="flex-1">
                <Card.Title>{g.name}</Card.Title>
                <Card.Description>{g.description}</Card.Description>
              </View>
              <Button isIconOnly variant="ghost">
                <MaterialIcons name="close" size={20} />
              </Button>
            </Card.Header>
            <Card.Body className="flex flex-row flex-wrap gap-2">
              {g.permissions.slice(0, 3).map(([key, value]) => (
                <Chip key={key} variant="secondary">
                  <Chip.Label>
                    {key}: {value}
                  </Chip.Label>
                </Chip>
              ))}
              {g.permissions.length > 3 && (
                <Chip variant="secondary">
                  <Chip.Label>{g.permissions.length - 3} más</Chip.Label>
                </Chip>
              )}
            </Card.Body>
          </Card>
        </PressableFeedback>
      ))}
    </View>
  );
}
