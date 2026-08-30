import type { GroupSummary } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { getPermissionDescription } from "@fludge/utils/permissions/index";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";

export function GroupPermissionsSection({ group }: { group: GroupSummary }) {
  const permissions = group.permissions.map((permission) => ({
    permission,
    ...getPermissionDescription(permission),
  }));
  const resources = Array.from(new Set(permissions.map((item) => item.es)));

  if (permissions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <MaterialIcons name="info" size={20} className="text-muted" />
        <Typography.Paragraph color="muted">
          No hay permisos
        </Typography.Paragraph>
      </View>
    );
  }

  return (
    <View className="gap-y-5 py-3">
      {resources.map((resource) => (
        <View key={resource} className="gap-y-2">
          <Typography.Heading type="h3">{resource}</Typography.Heading>
          {permissions
            .filter((item) => item.es === resource)
            .map((item) => (
              <View
                key={item.permission}
                className="bg-muted/30 gap-y-2 rounded-2xl p-3"
              >
                <Chip variant="secondary" className="self-start">
                  <Chip.Label>
                    {item.es}: {item.description.es}
                  </Chip.Label>
                </Chip>
                <Typography.Paragraph color="muted">
                  {item.description.description}
                </Typography.Paragraph>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}
