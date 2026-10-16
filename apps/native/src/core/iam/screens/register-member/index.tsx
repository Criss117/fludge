import { Button, Host } from "@expo/ui/jetpack-compose";
import { useRegisterMemberForm } from "@fludge/client/iam/forms/member.form";
import { useRegisterMember } from "@fludge/client/iam/mutations/use-member.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { AuthFormInputs } from "@/core/iam/components/auth-form-inputs";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

export function RegisterMemberScreen() {
  const spacer = useKeyboardSpacer();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const mutation = useRegisterMember();
  const mutationToast = useMutationToast();
  const router = useRouter();

  const form = useRegisterMemberForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showPending("forms.member.register.pending");
      mutation.mutate(value, {
        onSuccess: () => {
          resetForm();
          router.back();
          mutationToast.showSuccess("forms.member.register.success");
        },
        onError: (error) => {
          mutationToast.showError("forms.member.register.error", error.message as TranslationKey);
        },
      });
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Host matchContents={{ vertical: true }} style={styles.hostContainer}>
          <SectionCard title="forms.member.sections.personal_data">
            <form.Field name="name">
              {(field) => <AuthFormInputs.NameInput field={field} />}
            </form.Field>
            <form.Field name="phone">
              {(field) => <AuthFormInputs.PhoneInput field={field} />}
            </form.Field>
          </SectionCard>
        </Host>
        <Host matchContents={{ vertical: true }} style={styles.hostContainer}>
          <SectionCard title="forms.member.sections.access_data">
            <form.Field name="email">
              {(field) => <AuthFormInputs.EmailInput field={field} />}
            </form.Field>
            <form.Field name="password">
              {(field) => <AuthFormInputs.PasswordInput field={field} />}
            </form.Field>
          </SectionCard>
        </Host>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={styles.hostContainer}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={form.handleSubmit}
          >
            <ThemedNativeText color={colors.onPrimary}>{t("forms.member.submit")}</ThemedNativeText>
          </Button>
        </Host>
        <Animated.View style={spacer} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.lg,
  },
  hostContainer: {
    width: "100%",
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
