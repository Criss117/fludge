import { Host } from "@expo/ui";
import type { MemberSummary } from "@fludge/client/iam/domain/entities";
import { PressableScale } from "pressto";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/core/shared/components/avatar";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { MemberCardProps } from "./types";
import { useMemberCard } from "./use-member-card";

interface SelectableMemberCardProps extends MemberCardProps {
  isSelected: boolean;
  onPress: (member: MemberSummary) => void;
}

export function SelectableMemberCard({
  member,
  menuOptions,
  isSelected,
  onPress,
}: SelectableMemberCardProps) {
  const colors = useThemeColor();

  return (
    <PressableScale
      onPress={() => onPress(member)}
      style={[
        styles.selectableContainer,
        {
          borderColor: isSelected ? colors.primary : "transparent",
        },
      ]}
    >
      <MemberCard member={member} menuOptions={menuOptions} />
    </PressableScale>
  );
}

export function MemberCard({ member, menuOptions }: MemberCardProps) {
  const colors = useThemeColor();
  const { state, actions, texts } = useMemberCard({ member, menuOptions });

  const hasMenu = state.menuOptions.length > 0;

  return (
    <View>
      <PressableScale
        onLongPress={actions.onLongPress}
        style={[styles.container, { backgroundColor: colors.onSecondary }]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Avatar name={member.user.name} />
            <View style={styles.memberInfoContainer}>
              <ThemedText numberOfLines={1} variant="h5">
                {member.user.name}
              </ThemedText>
              <ThemedText numberOfLines={1} variant="muted">
                {member.user.email}
              </ThemedText>
            </View>
            {/* Reserva el espacio del menú para que el texto no quede debajo */}
            {hasMenu && <View style={styles.menuSpacer} />}
          </View>
          <View>
            <ThemedText variant="muted">{texts.createdAt}</ThemedText>
          </View>
        </View>
      </PressableScale>

      {/* Hermano del PressableScale, no hijo */}
      {hasMenu && (
        <View style={styles.menuOptionsContainer}>
          <Host style={{ flex: 1 }}>
            <MenuOptions
              items={state.menuOptions}
              isExpanded={state.isExpanded}
              onExpandChange={actions.setIsExpanded}
            />
          </Host>
        </View>
      )}
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
    height: SPACING["5xl"],
    borderRadius: SPACING.md,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.md,
    columnGap: SPACING.md,
  },
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: SPACING.sm,
  },
  memberInfoContainer: {
    flex: 1,
  },
  menuSpacer: {
    width: MENU_SIZE,
  },
  menuOptionsContainer: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.xs,
    gap: SPACING.sm,
    width: MENU_SIZE,
    height: MENU_SIZE,
    paddingTop: SPACING.sm,
  },
});
