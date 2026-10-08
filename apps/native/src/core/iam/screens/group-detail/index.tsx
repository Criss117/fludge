import { Icon } from "@/core/shared/components/icon";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Column,
  ElevatedCard,
  Host,
  Spacer,
  HorizontalDivider,
  SingleChoiceSegmentedButtonRow,
  SegmentedButton,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  paddingAll,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import type { GroupDetail } from "@fludge/client/iam/domain/entities";
import { useRouter } from "expo-router";
import { Activity, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { GroupMembersSection } from "@/core/iam/sections/group-members";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import Animated from "react-native-reanimated";
import { PermissionsListSection } from "@/core/iam/sections/permissions-list";

interface Props {
  group: GroupDetail;
}

const TABS = [
  {
    key: "members",
    label: "resources.members.plural",
  },
  {
    key: "permissions",
    label: "resources.groups.plural",
  },
] as const;

export function GroupDetailScreen({ group }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"members" | "permissions">(
    "members",
  );
  const spacer = useKeyboardSpacer();

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <ElevatedCard
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.secondaryContainer,
            }}
          >
            <Column modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}>
              <ThemedNativeText variant="h5" maxLines={2}>
                {group.name}
              </ThemedNativeText>
              <StatusChip status={group.status} />
              <ThemedNativeText variant="muted">
                {group.description}
              </ThemedNativeText>
              <Spacer modifiers={[height(SPACING.sm)]} />
              <HorizontalDivider />
              <Spacer modifiers={[height(SPACING.sm)]} />
              <ThemedNativeText variant="muted">
                {group.createdAt.toLocaleString()}
              </ThemedNativeText>
            </Column>
          </ElevatedCard>
        </Host>

        <View>
          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <SingleChoiceSegmentedButtonRow>
              {TABS.map((ta) => (
                <SegmentedButton
                  key={ta.key}
                  colors={{
                    activeContainerColor: colors.primary,
                    activeContentColor: colors.onPrimary,
                    disabledActiveBorderColor: colors.onPrimary,
                    disabledActiveContentColor: colors.onPrimary,
                  }}
                  selected={selectedTab === ta.key}
                  onClick={() => setSelectedTab(ta.key)}
                >
                  <SegmentedButton.Label>
                    <ThemedNativeText
                      color={
                        selectedTab === ta.key
                          ? colors.onPrimary
                          : colors.onSurface
                      }
                    >
                      {t(ta.label)}
                    </ThemedNativeText>
                  </SegmentedButton.Label>
                </SegmentedButton>
              ))}
            </SingleChoiceSegmentedButtonRow>
          </Host>

          <Activity mode={selectedTab === "members" ? "visible" : "hidden"}>
            <GroupMembersSection group={group} />
          </Activity>

          <Activity mode={selectedTab === "permissions" ? "visible" : "hidden"}>
            <PermissionsListSection group={group} />
          </Activity>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={() =>
              router.push({
                pathname: "/dashboard/groups/[groupid]/assign-members",
                params: { groupid: group.id },
              })
            }
          >
            <Icon name="group-add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("screens.groups.assign_members.title")}
            </ThemedNativeText>
          </Button>
        </Host>
        <Animated.View style={spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    rowGap: SPACING.md,
  },
});
