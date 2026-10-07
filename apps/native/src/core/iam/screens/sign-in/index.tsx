import { NativeFieldError } from "@/core/shared/components/field-error";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Card,
  Column,
  HorizontalDivider,
  Host,
  RNHostView,
} from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxWidth,
  padding,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useSignInForm } from "@fludge/client/iam/forms/sign-in-form";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useInvalidateSync } from "@fludge/client/sync/use-invalidate-sync";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import { AuthFormInputs } from "@/core/iam/components/auth-form-inputs";
import { Link } from "expo-router";
import { PressableScale } from "pressto";

const windowWidth = Dimensions.get("window").width;

export function SignInScreen() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [rootError, setRootError] = useState<string | null>(null);
  const { invalidateSync } = useInvalidateSync();
  const { signInEmail } = useAuth();

  const form = useSignInForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      signInEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
          invalidateSync();
        },
        onError: (error) => {
          setRootError(error.message);
        },
      });
    },
  });

  return (
    <ThemedView style={styles.container}>
      <Host matchContents>
        <Card
          colors={{
            containerColor: colors.onSecondary,
          }}
          modifiers={[width(Math.floor(windowWidth * 0.9))]}
        >
          <Column
            modifiers={[
              padding(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm),
              fillMaxWidth(),
            ]}
            verticalArrangement={{
              spacedBy: SPACING.md,
            }}
          >
            <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
              <ThemedNativeText variant="h1">{t("app.title")}</ThemedNativeText>
              <ThemedNativeText variant="muted">
                {t("screens.sign_in.description")}
              </ThemedNativeText>
              {rootError && <NativeFieldError>{rootError}</NativeFieldError>}
            </Column>
            <HorizontalDivider color={colors.primaryContainer} />

            <Column
              verticalArrangement={{
                spacedBy: SPACING.md,
              }}
            >
              <Column
                verticalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <form.Field name="email">
                  {(field) => <AuthFormInputs.EmailInput field={field} />}
                </form.Field>
                <form.Field name="password">
                  {(field) => <AuthFormInputs.PasswordInput field={field} />}
                </form.Field>
              </Column>

              <Button
                onClick={form.handleSubmit}
                modifiers={[fillMaxWidth()]}
                colors={{
                  containerColor: colors.primaryContainer,
                }}
              >
                <ThemedNativeText color={colors.onPrimaryContainer}>
                  {t("forms.auth.sign_in")}
                </ThemedNativeText>
              </Button>
            </Column>
          </Column>

          <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
            <RNHostView modifiers={[fillMaxWidth()]} matchContents>
              <View style={styles.footer}>
                <Link href="/sign-up" push asChild>
                  <PressableScale>
                    <ThemedText variant="muted">
                      {t("screens.sign_in.no_account")}{" "}
                      <ThemedText>{t("screens.sign_in.sign_up")}</ThemedText>
                    </ThemedText>
                  </PressableScale>
                </Link>
              </View>
            </RNHostView>
          </Column>
        </Card>
      </Host>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: SPACING.md,
  },
});
