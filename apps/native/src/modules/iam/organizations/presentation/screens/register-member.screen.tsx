import { MaterialIcons } from "@/modules/shared/components/icons";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRegisterMember } from "@fludge/client/application/iam/mutations/use-member.mutations";
import { useRegisterMemberForm } from "@fludge/client/application/iam/form/member-form";
import { AuthFormInputs } from "@/modules/iam/auth/presentation/components/auth-form-inputs";

const PADDING_BOTTOM = 20;

export function RegisterMemberScreen() {
  const { t } = useTranslation();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const mutation = useRegisterMember();

  const form = useRegisterMemberForm({
    onSubmit: ({ value, resetForm }) => {
      mutation.mutate(value, { onSuccess: resetForm });
    },
  });

  const keyboardSpacer = useAnimatedStyle(() => {
    const keyboardHeight = height.get();

    return {
      height: Math.abs(keyboardHeight),
      marginBottom: keyboardHeight > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  return (
    <View className="relative flex-1">
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-32">
        <View className="gap-y-8">
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>
                {t("screens.members.register_member.credentials")}
              </Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
          {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
          <form.Field
                name="email"
                children={(field) => (
                  <AuthFormInputs.EmailInput field={field} />
                )}
              />
          {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
          <form.Field
                name="password"
                children={(field) => (
                  <AuthFormInputs.PasswordInput field={field} />
                )}
              />
            </Card.Body>
          </Card>

          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>
                {t("screens.members.register_member.personal_info")}
              </Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
          {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
          <form.Field
                name="name"
                children={(field) => <AuthFormInputs.NameInput field={field} />}
              />

          {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
          <form.Field
                name="phone"
                children={(field) => (
                  <AuthFormInputs.PhoneInput field={field} />
                )}
              />
            </Card.Body>
          </Card>
        </View>
        <Animated.View style={keyboardSpacer} />
      </ScrollView>

      <View className="bg-background absolute bottom-0 w-full px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={mutation.isPending}>
          <MaterialIcons name="person-add" size={20} className="text-eclipse" />
          <Button.Label>
            {t("screens.members.register_member.submit")}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
