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
import { LocalMember } from "@fludge/client/iam/domain/entities";
import { useTranslation } from "react-i18next";
import { MemberCardOptions } from "./options";

export function MemberCard({ member }: { member: LocalMember }) {
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
            <MemberCardOptions member={member} />
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
