import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type { Resource } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { useTranslation } from "react-i18next";
import { TranslationKey } from "@fludge/i18n/index";
import type { GroupSummary } from "@fludge/client/application/iam/domain/group.repository";

export function GroupPermissionsSection({ group }: { group: GroupSummary }) {
  const { t } = useTranslation();

  if (group.permissions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <MaterialIcons name="info" size={20} className="text-muted" />
        <Typography.Paragraph color="muted">
          No hay permisos
        </Typography.Paragraph>
      </View>
    );
  }

  const permissionsRecord = Permissions.fromList(group.permissions).toRecord();

  return (
    <View className="gap-y-5 py-3">
      {Object.entries(permissionsRecord).map(([resource, actions]) => {
        const resourceKey = `permissions.${resource}.name` as TranslationKey;

        return (
          <View key={`${resource}`} className="gap-y-2">
            <Typography.Heading type="h3">{t(resourceKey)}</Typography.Heading>
            {actions.map((action) => {
              const nameKey =
                `permissions.${resource as Resource}.${action}.name` as TranslationKey;
              const descriptionKey =
                `permissions.${resource as Resource}.${action}.description` as TranslationKey;

              return (
                <View
                  key={`${resource}:${action}`}
                  className="bg-muted/30 gap-y-2 rounded-2xl p-3"
                >
                  <Chip variant="secondary" className="self-start">
                    <Chip.Label>{t(nameKey)}</Chip.Label>
                  </Chip>
                  <Typography.Paragraph color="muted">
                    {t(descriptionKey)}
                  </Typography.Paragraph>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
