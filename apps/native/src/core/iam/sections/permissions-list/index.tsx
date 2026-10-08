import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  AssistChip,
  Column,
  HorizontalDivider,
  Host,
  Row,
} from "@expo/ui/jetpack-compose";
import type { GroupDetail } from "@fludge/client/iam/domain/entities";
import { TranslationKey } from "@fludge/i18n/index";
import { Resource } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  group: GroupDetail;
}

export function PermissionsListSection({ group }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const permissionsRecord = Object.entries(
    Permissions.fromList(group.permissions).toRecord(),
  );

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <Column
        verticalArrangement={{
          spacedBy: SPACING.sm,
        }}
      >
        {permissionsRecord.map(([resource, actions], index) => {
          const resourceKey = `permissions.${resource}.name` as TranslationKey;

          return (
            <Column
              key={`${resource}`}
              verticalArrangement={{
                spacedBy: SPACING.sm,
              }}
            >
              <ThemedNativeText variant="h4">{t(resourceKey)}</ThemedNativeText>
              <Column>
                {actions.map((action) => {
                  const nameKey =
                    `permissions.${resource as Resource}.${action}.name` as TranslationKey;
                  const descriptionKey =
                    `permissions.${resource as Resource}.${action}.description` as TranslationKey;

                  return (
                    <Row
                      key={`${resource}:${action}`}
                      verticalArrangement={{
                        spacedBy: SPACING.sm,
                      }}
                    >
                      <ThemedNativeText>{t(nameKey)}: </ThemedNativeText>
                      <ThemedNativeText variant="muted">
                        {t(descriptionKey)}
                      </ThemedNativeText>
                    </Row>
                  );
                })}
              </Column>
              {index < permissionsRecord.length - 1 && (
                <HorizontalDivider color={colors.onSurface} />
              )}
            </Column>
          );
        })}
      </Column>
    </Host>
  );
}
