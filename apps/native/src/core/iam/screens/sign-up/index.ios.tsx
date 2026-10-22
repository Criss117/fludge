import { Button, Divider, Host, RNHostView, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { PressableScale } from "pressto";
import { Dimensions, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { AuthFormInputs } from "@/core/iam/components/auth-form-inputs";
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ThemedView style={styles.container}>
        <Host matchContents>
          <VStack
            modifiers={[
              frame({
                width: Math.floor(windowWidth * 0.8),
              }),
            ]}
            spacing={SPACING.xl}
          >
            <VStack>
              <ThemedNativeText variant="h1">{texts.title}</ThemedNativeText>
              <ThemedNativeText variant="muted">{texts.description}</ThemedNativeText>
            </VStack>

            <Divider />

            <VStack spacing={SPACING.md}>
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
              <Button
                onPress={actions.onSubmit}
                modifiers={[buttonStyle("borderedProminent"), tint(colors.primary)]}
              >
                <ThemedNativeText
                  modifiers={[frame({ maxWidth: Infinity })]}
                  color={colors.onPrimary}
                  variant="h6"
                >
                  {texts.submit}
                </ThemedNativeText>
              </Button>
            </VStack>

            <RNHostView matchContents>
              <View style={styles.footer}>
                <PressableScale onPress={() => router.back()}>
                  <ThemedText variant="muted">
                    {texts.alreadyAccount} <ThemedText>{texts.signIn}</ThemedText>
                  </ThemedText>
                </PressableScale>
              </View>
            </RNHostView>
          </VStack>
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
