import { useRegisterMember } from "@fludge/client/application/iam/organization/mutations/use-member.mutations";
import { useRegisterMemberForm } from "@fludge/client/presentation/iam/organization/register-member.form";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ScrollView, View } from "react-native";
import { CommonInputs } from "@/modules/shared/components/common-input";

const PADDING_BOTTOM = 20;

export function RegisterMemberScreen() {
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
              <Card.Title>Credenciales</Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.AppField
                name="email"
                children={(field) => (
                  <field.EmailField
                    children={({ field: state, id, isInvalid }) => (
                      <CommonInputs.EmailInput
                        isInvalid={isInvalid}
                        id={id}
                        value={state.state.value}
                        onBlur={state.handleBlur}
                        onChangeText={state.handleChange}
                        errors={state.state.meta.errors}
                      />
                    )}
                  />
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.PasswordField
                    children={({ field: state, id, isInvalid }) => (
                      <CommonInputs.PasswordInput
                        isInvalid={isInvalid}
                        id={id}
                        value={state.state.value}
                        onBlur={state.handleBlur}
                        onChangeText={state.handleChange}
                        errors={state.state.meta.errors}
                      />
                    )}
                  />
                )}
              />
            </Card.Body>
          </Card>

          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>Información Personal</Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.AppField
                name="phone"
                children={(field) => (
                  <field.PhoneField
                    children={({ field: state, id, isInvalid }) => (
                      <CommonInputs.PhoneInput
                        isInvalid={isInvalid}
                        id={id}
                        value={state.state.value}
                        onBlur={state.handleBlur}
                        onChangeText={state.handleChange}
                        errors={state.state.meta.errors}
                      />
                    )}
                  />
                )}
              />
              <form.AppField
                name="name"
                children={(field) => (
                  <field.NameField
                    children={({ field: state, id, isInvalid }) => (
                      <CommonInputs.UserNameInput
                        isInvalid={isInvalid}
                        id={id}
                        value={state.state.value}
                        onBlur={state.handleBlur}
                        onChangeText={state.handleChange}
                        errors={state.state.meta.errors}
                      />
                    )}
                  />
                )}
              />
            </Card.Body>
          </Card>
        </View>
        <Animated.View style={keyboardSpacer} />
      </ScrollView>

      <View className="bg-background absolute bottom-0 w-full px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={mutation.isPending}>
          <MaterialIcons
            name="person-add"
            size={20}
            className="text-white dark:text-black"
          />
          <Button.Label>Registrar Miembro</Button.Label>
        </Button>
      </View>
    </View>
  );
}
