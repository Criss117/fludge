import { Card } from "heroui-native/card";
import { ScrollView, View } from "react-native";
import { OrganizationFormInputs } from "@/modules/iam/organizations/presentation/components/organization-form-inputs";
import { Button } from "heroui-native/button";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useFindAllOrganizations } from "@fludge/client/application/iam/queries/use-find-organization";
import { useRegisterOrganization } from "@fludge/client/application/iam/mutations/use-organization.mutations";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { useRegisterOrganizationForm } from "@fludge/client/application/iam/form/organization-form";
import { KeyboardScrollView } from "@/modules/shared/components/keyboard-scroll-view";

export function RegisterOrganizationScreen() {
  const { t } = useTranslation();
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

  const hasOrganizations = data.length > 0;

  return (
    <View className="relative flex-1">
      <KeyboardScrollView
        className="flex-1 px-3"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-8">
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>
                {t(
                  "screens.organizations.register_organization.commercial_data"
                )}
              </Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.Field
                name="name"
                children={(field) => (
                  <OrganizationFormInputs.NameInput field={field} />
                )}
              />
              <form.Field
                name="legalName"
                children={(field) => (
                  <OrganizationFormInputs.LegalNameInput field={field} />
                )}
              />
              <form.Field
                name="taxId"
                children={(field) => (
                  <OrganizationFormInputs.TaxIdInput field={field} />
                )}
              />
            </Card.Body>
          </Card>
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>
                {t(
                  "screens.organizations.register_organization.location_contact"
                )}
              </Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              <form.Field
                name="phone"
                children={(field) => (
                  <OrganizationFormInputs.PhoneInput field={field} />
                )}
              />
              <form.Field
                name="address"
                children={(field) => (
                  <OrganizationFormInputs.AddressInput field={field} />
                )}
              />
            </Card.Body>
          </Card>
        </View>
      </KeyboardScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button
          onPress={form.handleSubmit}
          isDisabled={registerOrganization.isPending}
        >
          <MaterialIcons
            name="add-business"
            size={20}
            className="text-eclipse"
          />
          <Button.Label className="text-eclipse">
            {t("screens.organizations.register_organization.submit")}
          </Button.Label>
        </Button>
        {hasOrganizations && (
          <Link href="/(private)/organization/select" asChild replace>
            <PressableFeedback>
              <Typography
                className="text-muted text-center underline"
                type="body-sm"
              >
                {t("screens.organizations.register_organization.cancel")}
              </Typography>
            </PressableFeedback>
          </Link>
        )}
      </View>
    </View>
  );
}
