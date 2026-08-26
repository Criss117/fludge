import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useSignInForm } from "@fludge/client/presentation/iam/auth/auth-form";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Separator } from "heroui-native/separator";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { EmailInput, PasswordInput } from "../components/auth-form-inputs";
import { Typography } from "heroui-native/text";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { FieldError } from "heroui-native/field-error";

export function SignInScreen() {
  const router = useRouter();
  const { signInEmail } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useSignInForm({
    onSubmit: ({ value, resetForm }) => {
      signInEmail.mutate(value, {
        onSettled: () => {
          setRootError(null);
        },
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
            Completa tus datos para iniciar sesión
          </Card.Description>
        </Card.Header>
        <Separator />
        <Card.Body className="gap-y-4 py-4">
          {rootError && (
            <FieldError isInvalid={!!rootError}>{rootError}</FieldError>
          )}
          <form.AppField
            name="email"
            children={(field) => (
              <field.EmailField
                children={({ field, id, isInvalid }) => (
                  <EmailInput
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
                children={({
                  field,
                  id,
                  isInvalid,
                  setShowPassword,
                  showPassword,
                }) => (
                  <PasswordInput
                    isInvalid={isInvalid}
                    id={id}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(e) => field.handleChange(e)}
                    setShowPassword={setShowPassword}
                    showPassword={showPassword}
                    errors={field.state.meta.errors}
                  />
                )}
              />
            )}
          />
          <Button
            onPress={form.handleSubmit}
            isDisabled={signInEmail.isPending}
          >
            Iniciar sesión
          </Button>
        </Card.Body>
        <Separator />
        <Card.Footer>
          <Link href="/auth/sign-up" replace asChild>
            <PressableFeedback className="w-full py-2">
              <Typography>
                No tienes cuenta?{" "}
                <Typography className="text-accent underline">
                  Regístrate
                </Typography>
              </Typography>
            </PressableFeedback>
          </Link>
        </Card.Footer>
      </Card>
    </View>
  );
}
