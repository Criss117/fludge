import {
  Button,
  Card,
  Column,
  HorizontalDivider,
  Host,
  RNHostView,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding, width } from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { PressableScale } from "pressto";
import { Dimensions, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { AuthFormInputs } from "@/core/iam/components/auth-form-inputs";
import { NativeFieldError } from "@/core/shared/components/field-error";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useSignUpScreen } from "./use-sign-up";

const windowWidth = Dimensions.get("window").width;

export function SignUpScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { actions, state, texts } = useSignUpScreen();

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
              modifiers={[padding(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm), fillMaxWidth()]}
              verticalArrangement={{
                spacedBy: SPACING.md,
              }}
            >
              <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
                <ThemedNativeText variant="h1">{texts.title}</ThemedNativeText>
                <ThemedNativeText variant="muted">{texts.description}</ThemedNativeText>
                {state.rootError && <NativeFieldError>{state.rootError}</NativeFieldError>}
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
                  <state.form.Field name="name">
                    {(field) => <AuthFormInputs.NameInput field={field} />}
                  </state.form.Field>
                  <state.form.Field name="phone">
                    {(field) => <AuthFormInputs.PhoneInput field={field} />}
                  </state.form.Field>
                  <state.form.Field name="email">
                    {(field) => <AuthFormInputs.EmailInput field={field} />}
                  </state.form.Field>
                  <state.form.Field name="password">
                    {(field) => <AuthFormInputs.PasswordInput field={field} />}
                  </state.form.Field>
                </Column>

                <Button
                  onClick={actions.onSubmit}
                  modifiers={[fillMaxWidth()]}
                  colors={{
                    containerColor: colors.primaryContainer,
                  }}
                >
                  <ThemedNativeText color={colors.onPrimaryContainer}>
                    {texts.submit}
                  </ThemedNativeText>
                </Button>
              </Column>
            </Column>

            <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
              <RNHostView modifiers={[fillMaxWidth()]} matchContents>
                <View style={styles.footer}>
                  <PressableScale onPress={() => router.back()}>
                    <ThemedText variant="muted">
                      {texts.alreadyAccount} <ThemedText>{texts.signIn}</ThemedText>
                    </ThemedText>
                  </PressableScale>
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
