import { Avatar } from "@/core/shared/components/avatar";
import { Icon } from "@/core/shared/components/icon";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  AssistChip,
  Column,
  ElevatedCard,
  Host,
  RNHostView,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";
import type { MemberSummary } from "@fludge/client/iam/domain/entities";
import {
  type MenuOptionItem,
  MenuOptions,
} from "@/core/shared/components/menu-options";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { PressableScale } from "pressto";
export type MenuOptions = {
  hide?: boolean;
  items?: MenuOptionItem[];
};
interface Props {
  member: MemberSummary;
  menuOptions?: MenuOptions;
}

interface SelectableMemberCardProps extends Props {
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
        {
          borderWidth: 2,
          borderRadius: SPACING.md,
          borderColor: isSelected ? colors.primary : "transparent",
        },
      ]}
    >
      <MemberCard member={member} menuOptions={menuOptions} />
    </PressableScale>
  );
}

export function MemberCard({ member, menuOptions }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();

  const items = useMemo(() => {
    const baseItems: MenuOptionItem[] = [
      {
        label: "helpers.navigation.see_details",
        action: () => {
          router.push({
            pathname: "/dashboard/members/[memberid]",
            params: { memberid: member.id },
          });
        },
        icon: "visibility",
      },
      ...(menuOptions?.items ?? []),
    ];

    return baseItems;
  }, [menuOptions, router]);

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <ElevatedCard
        modifiers={[fillMaxWidth()]}
        colors={{
          containerColor: colors.secondaryContainer,
        }}
      >
        <Column modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}>
          <Row>
            <RNHostView matchContents>
              <Avatar name={member.user.name} />
            </RNHostView>
            <Spacer modifiers={[width(SPACING.sm)]} />
            <Column modifiers={[weight(1)]}>
              <ThemedNativeText maxLines={1}>
                {member.user.name}
              </ThemedNativeText>
              <ThemedNativeText variant="muted" maxLines={1}>
                {member.user.email}
              </ThemedNativeText>
            </Column>
            {!menuOptions?.hide && <MenuOptions items={items} />}
          </Row>
          <Row
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            {member.user.isRoot ? (
              <AssistChip
                colors={{
                  containerColor: colors.primary,
                  labelColor: colors.onPrimary,
                  leadingIconContentColor: colors.onPrimary,
                  trailingIconContentColor: colors.onPrimary,
                }}
              >
                <AssistChip.Label>
                  <ThemedNativeText color={colors.onPrimary}>
                    {t("resources.members.root")}
                  </ThemedNativeText>
                </AssistChip.Label>
                <AssistChip.LeadingIcon>
                  <Icon name="person" size={18} />
                </AssistChip.LeadingIcon>
              </AssistChip>
            ) : (
              <AssistChip
                colors={{
                  containerColor: colors.surface,
                  labelColor: colors.onSurface,
                  leadingIconContentColor: colors.onSurface,
                  trailingIconContentColor: colors.onSurface,
                }}
              >
                <AssistChip.Label>
                  <ThemedNativeText color={colors.onSurface}>
                    {t("resources.members.single")}
                  </ThemedNativeText>
                </AssistChip.Label>
                <AssistChip.LeadingIcon>
                  <Icon name="person" size={18} />
                </AssistChip.LeadingIcon>
              </AssistChip>
            )}
            <StatusChip status={member.status} />
          </Row>
        </Column>
      </ElevatedCard>
    </Host>
  );
}
