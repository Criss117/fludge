import { Link, useRouter } from "expo-router";
import { useSignUpForm } from "@fludge/client/presentation/iam/auth/auth-form";
import { View } from "react-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Separator } from "heroui-native/separator";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { FieldError } from "heroui-native/field-error";
import { CommonInputs } from "@/modules/shared/components/common-input";

export function SignUpScreen() {
  const router = useRouter();
  const { signUpEmail } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useSignUpForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      signUpEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
          router.replace({
            pathname: "/dashboard",
          });
        },
        onError: (error) => {
          setRootError(error.message);
        },
      });
    },
  });

  return (
    <View className="flex-1 justify-center px-3">
      <Card>
        <Card.Header className="pb-4">
          <View className="flex w-full items-center justify-center">
            <Card.Title className="text-3xl font-bold">Fludge</Card.Title>
          </View>
          <Card.Description>
            Completa tus datos para registrarte
          </Card.Description>
        </Card.Header>
        <Separator />
        <Card.Body className="gap-y-4 py-4">
          {rootError && (
            <FieldError isInvalid={!!rootError}>{rootError}</FieldError>
          )}
          <form.AppField
            name="name"
            children={(field) => (
              <field.NameField
                children={({ field, id, isInvalid }) => (
                  <CommonInputs.UserNameInput
                    isInvalid={isInvalid}
                    id={id}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(e) => field.handleChange(e)}
                    errors={field.state.meta.errors}
                  />
                )}
              />
            )}
          />
          <form.AppField
            name="phone"
            children={(field) => (
              <field.PhoneField
                children={({ field, id, isInvalid }) => (
                  <CommonInputs.PhoneInput
                    isInvalid={isInvalid}
                    id={id}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(e) => field.handleChange(e)}
                    errors={field.state.meta.errors}
                  />
                )}
              />
            )}
          />
          <form.AppField
            name="email"
            children={(field) => (
              <field.EmailField
                children={({ field, id, isInvalid }) => (
                  <CommonInputs.EmailInput
                    isInvalid={isInvalid}
                    id={id}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(e) => field.handleChange(e)}
                    errors={field.state.meta.errors}
                  />
                )}
              />
            )}
          />
          <form.AppField
            name="password"
            children={(field) => (
              <field.PasswordField
                children={({ field, id, isInvalid }) => (
                  <CommonInputs.PasswordInput
                    isInvalid={isInvalid}
                    id={id}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(e) => field.handleChange(e)}
                    errors={field.state.meta.errors}
                  />
                )}
              />
            )}
          />
          <Button onPress={form.handleSubmit}>Registrarse</Button>
        </Card.Body>
        <Separator />
        <Card.Footer>
          <Link href="/auth/sign-in" replace asChild>
            <PressableFeedback className="w-full py-2">
              <Typography className="text-muted">
                Ya tienes cuenta?{" "}
                <Typography className="underline">Inicia sesión</Typography>
              </Typography>
            </PressableFeedback>
          </Link>
        </Card.Footer>
      </Card>
    </View>
  );
}
