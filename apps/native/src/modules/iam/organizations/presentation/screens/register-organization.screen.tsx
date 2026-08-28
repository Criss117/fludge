import { useRegisterOrganizationForm } from "@fludge/client/presentation/iam/organization/register-organization.form";
import { Card } from "heroui-native/card";
import { ScrollView, View } from "react-native";
import { OrganizationFormInputs } from "@/modules/iam/organizations/presentation/components/organization-form-inputs";
import { Button } from "heroui-native/button";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useFindAllOrganizations } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { useRegisterOrganization } from "@fludge/client/application/iam/organization/mutations/use-register-organization";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { CommonInputs } from "@/modules/shared/components/common-input";

const PADDING_BOTTOM = 20;

export function RegisterOrganizationScreen() {
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const router = useRouter();
  const { data } = useFindAllOrganizations();
  const registerOrganization = useRegisterOrganization();

  const form = useRegisterOrganizationForm({
    onSubmit: ({ value, resetForm }) => {
      registerOrganization.mutate(value, {
        onSuccess: () => {
          router.replace({
            pathname: "/(private)/dashboard/(tabs)",
          });
          resetForm();
        },
      });
    },
  });

  const fakeView = useAnimatedStyle(() => {
    const h = height.get();

    return {
      height: Math.abs(h),
      marginBottom: h > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  const hasOrganizations = data.length > 0;

  return (
    <View className="relative flex-1">
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-32">
        <View className="gap-y-8">
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>Datos Comerciales</Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.AppField
                name="name"
                children={(field) => (
                  <field.NameField
                    children={({ field, id, isInvalid }) => (
                      <OrganizationFormInputs.NameInput
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
                name="legalName"
                children={(field) => (
                  <field.NameField
                    children={({ field, id, isInvalid }) => (
                      <OrganizationFormInputs.LegalNameInput
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
                name="taxId"
                children={(field) => (
                  <field.NameField
                    children={({ field, id, isInvalid }) => (
                      <OrganizationFormInputs.TaxIdInput
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
            </Card.Body>
          </Card>
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>Ubicación y Contacto</Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.AppField
                name="phone"
                children={(field) => (
                  <field.NameField
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
                name="address"
                children={(field) => (
                  <field.NameField
                    children={({ field, id, isInvalid }) => (
                      <CommonInputs.AddressInput
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
            </Card.Body>
          </Card>
        </View>

        <Animated.View style={fakeView} />
      </ScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button
          onPress={form.handleSubmit}
          isDisabled={registerOrganization.isPending}
        >
          <MaterialIcons
            name="add-business"
            size={20}
            className="text-white dark:text-black"
          />
          <Button.Label>Registrar Organización</Button.Label>
        </Button>
        {hasOrganizations && (
          <Link href="/(private)/organization/select" asChild replace>
            <PressableFeedback>
              <Typography
                className="text-muted text-center underline"
                type="body-sm"
              >
                Cancelar e ir a la Selección de Organizaciones
              </Typography>
            </PressableFeedback>
          </Link>
        )}
      </View>
    </View>
  );
}
