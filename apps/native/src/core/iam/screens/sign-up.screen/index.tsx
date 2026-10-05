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
  fillMaxWidth,
  padding,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useSignUpForm } from "@fludge/client/iam/forms/sign-in-form";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useInvalidateSync } from "@fludge/client/sync/use-invalidate-sync";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import { AuthFormInputs } from "@/core/iam/components/auth-form-inputs";
import { Link } from "expo-router";
import { PressableScale } from "pressto";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const windowWidth = Dimensions.get("window").width;

export function SignUpScreen() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { signUpEmail } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useSignUpForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      console.log(value);
      signUpEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
        },
        onError: (error) => {
          setRootError(error.message);
        },
      });
    },
  });

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
                <ThemedNativeText variant="h1">
                  {t("app.title")}
                </ThemedNativeText>
                <ThemedNativeText variant="muted">
                  {t("screens.sign_up.description")}
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
                  <form.Field name="name">
                    {(field) => <AuthFormInputs.NameInput field={field} />}
                  </form.Field>
                  <form.Field name="phone">
                    {(field) => <AuthFormInputs.PhoneInput field={field} />}
                  </form.Field>
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
                    {t("forms.auth.sign_up")}
                  </ThemedNativeText>
                </Button>
              </Column>
            </Column>

            <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
              <RNHostView modifiers={[fillMaxWidth()]} matchContents>
                <View style={styles.footer}>
                  <Link href="/" replace asChild>
                    <PressableScale>
                      <ThemedText variant="muted">
                        {t("screens.sign_up.already_account")}{" "}
                        <ThemedText>{t("screens.sign_up.sign_in")}</ThemedText>
                      </ThemedText>
                    </PressableScale>
                  </Link>
                </View>
              </RNHostView>
            </Column>
          </Card>
        </Host>
      </ThemedView>
    </KeyboardAvoidingView>
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
