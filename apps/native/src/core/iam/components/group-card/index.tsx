import { Host } from "@expo/ui";
import type { GroupSummary } from "@fludge/client/iam/domain/entities";
import type { TranslationKey } from "@fludge/i18n/index";
import type { ActionFor, Resource } from "@fludge/utils/permissions/data";
import { PressableScale } from "pressto";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { MenuOptions } from "@/core/shared/components/menu-options";
import type { MenuOptionItem } from "@/core/shared/components/menu-options/types";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useGroupCard } from "./use-group-card";

export type MenuOptionsType = {
  hide?: boolean;
  items?: MenuOptionItem[];
};

interface Props {
  group: GroupSummary;
  menuOptions?: MenuOptionsType;
}

interface SelectableGroupCardProps extends Props {
  isSelected: boolean;
  onPress: (group: GroupSummary) => void;
}

export function SelectableGroupCard({
  group,
  menuOptions,
  isSelected,
  onPress,
}: SelectableGroupCardProps) {
  const colors = useThemeColor();

  return (
    <PressableScale
      onPress={() => onPress(group)}
      style={[
        styles.selectableContainer,
        {
          borderColor: isSelected ? colors.primary : "transparent",
        },
      ]}
    >
      <GroupCard group={group} menuOptions={menuOptions} />
    </PressableScale>
  );
}

export function GroupCard({ group, menuOptions }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { state, actions } = useGroupCard({ group, menuOptions });

  return (
    <View style={[styles.container, { backgroundColor: colors.onSecondary }]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <ThemedText numberOfLines={1} variant="h5">
              {group.name}
            </ThemedText>
            <StatusChip status={group.status} />
          </View>

          {state.hasMenu && (
            <Host style={styles.menuHost}>
              <MenuOptions
                items={state.menuOptions}
                isExpanded={state.isExpanded}
                onExpandChange={actions.setIsExpanded}
              />
            </Host>
          )}
        </View>

        <ThemedText numberOfLines={2} variant="muted">
          {group.description}
        </ThemedText>

        <View style={styles.permissionsContainer}>
          {group.permissions.slice(0, 3).map((p) => {
            const [resource, action] = p.split(":") as [Resource, ActionFor<Resource>];

            const nameKey = `permissions.${resource}.${action}.name` as TranslationKey;
            const descriptionKey =
              `permissions.${resource}.${action}.description` as TranslationKey;

            return (
              <View key={p} style={[styles.permissionChip, { backgroundColor: colors.surface }]}>
                <ThemedText variant="sm">
                  {t(nameKey)}: {t(descriptionKey)}
                </ThemedText>
              </View>
            );
          })}
          {group.permissions.length > 3 && (
            <View style={[styles.permissionChip, { backgroundColor: colors.surface }]}>
              <ThemedText variant="sm">
                {t("helpers.x_more", {
                  count: group.permissions.length - 3,
                })}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          <ThemedText variant="muted">Creado el: {group.createdAt.toLocaleDateString()}</ThemedText>

          <ThemedText variant="muted">
            {group.totalMembers} {t("resources.members.plural")}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const MENU_SIZE = SPACING["2xl"];

const styles = StyleSheet.create({
  selectableContainer: {
    borderWidth: 2,
    borderRadius: SPACING.md,
  },
  container: {
    borderRadius: SPACING.md,
    overflow: "hidden",
  },
  content: {
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: SPACING.sm,
  },
  titleSection: {
    flex: 1,
    rowGap: SPACING.xs,
  },
  menuHost: {
    width: MENU_SIZE,
    height: MENU_SIZE,
  },
  permissionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  permissionChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xl,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: SPACING.sm,
  },
});
