import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  AssistChip,
  Column,
  ElevatedCard,
  FlowRow,
  Host,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { GroupSummary } from "@fludge/client/iam/domain/entities";
import { useTranslation } from "react-i18next";
import { type GroupCardMenuItems, GroupCardOptions } from "./options";
import type { ActionFor, Resource } from "@fludge/utils/permissions/data";
import type { TranslationKey } from "@fludge/i18n/index";

export type MenuOptions = {
  hide?: boolean;
  items?: GroupCardMenuItems;
};

interface Props {
  group: GroupSummary;
  menuOptions?: MenuOptions;
}

export function GroupCard({ group, menuOptions }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <ElevatedCard
        modifiers={[fillMaxWidth()]}
        colors={{
          containerColor: colors.secondaryContainer,
        }}
      >
        <Column
          modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
          verticalArrangement={{
            spacedBy: SPACING.md,
          }}
        >
          <Column>
            <Row>
              <Row
                modifiers={[weight(1)]}
                verticalAlignment="center"
                horizontalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <ThemedNativeText maxLines={1} variant="h5">
                  {group.name}
                </ThemedNativeText>
                <StatusChip status={group.status} />
              </Row>

              {!menuOptions?.hide && (
                <GroupCardOptions group={group} items={menuOptions?.items} />
              )}
            </Row>
            <ThemedNativeText>{group.description}</ThemedNativeText>
          </Column>

          <FlowRow>
            {group.permissions.slice(0, 3).map((p) => {
              const [resource, action] = p.split(":") as [
                Resource,
                ActionFor<Resource>,
              ];

              const nameKey =
                `permissions.${resource}.${action}.name` as TranslationKey;
              const descriptionKey =
                `permissions.${resource}.${action}.description` as TranslationKey;

              return (
                <AssistChip
                  key={p}
                  colors={{
                    containerColor: colors.surface,
                    labelColor: colors.onSurface,
                    leadingIconContentColor: colors.onSurface,
                    trailingIconContentColor: colors.onSurface,
                  }}
                >
                  <AssistChip.Label>
                    <ThemedNativeText>
                      {t(nameKey)}: {t(descriptionKey)}
                    </ThemedNativeText>
                  </AssistChip.Label>
                </AssistChip>
              );
            })}
            {group.permissions.length > 3 && (
              <AssistChip
                colors={{
                  containerColor: colors.surface,
                  labelColor: colors.onSurface,
                  leadingIconContentColor: colors.onSurface,
                  trailingIconContentColor: colors.onSurface,
                }}
              >
                <AssistChip.Label>
                  <ThemedNativeText>
                    {t("helpers.x_more", {
                      count: group.permissions.length - 3,
                    })}
                  </ThemedNativeText>
                </AssistChip.Label>
              </AssistChip>
            )}
          </FlowRow>

          <Row>
            <ThemedNativeText variant="muted">
              Creado el: {group.createdAt.toLocaleDateString()}
            </ThemedNativeText>

            <Spacer modifiers={[weight(1)]} />

            <ThemedNativeText variant="muted">
              {group.totalMembers} {t("resources.members.plural")}
            </ThemedNativeText>
          </Row>
        </Column>
      </ElevatedCard>
    </Host>
  );
}
