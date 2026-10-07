import { Avatar } from "@/core/shared/components/avatar";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Column,
  ElevatedCard,
  Host,
  RNHostView,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import type { MemberDetail } from "@fludge/client/iam/domain/entities";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { MemberGroupsSection } from "@/core/iam/sections/member-groups";

interface Props {
  member: MemberDetail;
}

export function MemberScreen({ member }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

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
            <Column
              modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
              horizontalAlignment="center"
            >
              <RNHostView matchContents>
                <Avatar name={member.user.name} size={SPACING["3xl"]} />
              </RNHostView>
              <ThemedNativeText variant="h5">
                {member.user.name}
              </ThemedNativeText>
              <ThemedNativeText variant="muted">
                {member.user.email}
              </ThemedNativeText>
            </Column>
          </ElevatedCard>
        </Host>

        <MemberGroupsSection member={member} />
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
          >
            <Icon name="group-add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.member.assign_groups")}
            </ThemedNativeText>
          </Button>
        </Host>
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
