import { useRegisterOrganizationForm } from "@fludge/client/presentation/iam/organization/register-organization.form";
import { Card } from "heroui-native/card";
import { View } from "react-native";
import { OrganizationFormInputs } from "@/modules/iam/organizations/presentation/components/organization-form-inputs";
import { Button } from "heroui-native/button";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useFindAllOrganizations } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { useRegisterOrganization } from "@fludge/client/application/iam/organization/mutations/use-register-organization";

export function RegisterOrganizationScreen() {
  const router = useRouter();
  const { data } = useFindAllOrganizations();
  const registerOrganization = useRegisterOrganization();
  const form = useRegisterOrganizationForm({
    onSubmit: ({ value, resetForm }) => {
      registerOrganization.mutate(value, {
        onSuccess: () => {
          router.replace({
            pathname: "/(private)/dashboard",
          });
          resetForm();
        },
      });
    },
  });

  const hasOrganizations = data.length > 0;

  return (
    <View className="flex-1">
      <View className="flex-1 gap-y-8 px-3">
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
                    <OrganizationFormInputs.PhoneInput
                      isInvalid={isInvalid}
                      id={id}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={(e) => field.handleChange(e)}
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
                    <OrganizationFormInputs.AddressInput
                      isInvalid={isInvalid}
                      id={id}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={(e) => field.handleChange(e)}
                    />
                  )}
                />
              )}
            />
          </Card.Body>
        </Card>
      </View>
      <View className="gap-y-4 px-3 py-6">
        <Button
          onPress={form.handleSubmit}
          isDisabled={registerOrganization.isPending}
        >
          <MaterialIcons name="add-business" size={20} className="text-white" />
          <Button.Label>Registrar Organización</Button.Label>
        </Button>
        {hasOrganizations && (
          <Link
            href="/(private)/organization/select"
            className="text-center"
            replace
          >
            Cancelar e ir a la Selección de Organizaciones
          </Link>
        )}
      </View>
    </View>
  );
}
