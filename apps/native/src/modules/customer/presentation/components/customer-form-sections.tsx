import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Card } from "heroui-native/card";
import { Separator } from "heroui-native/separator";
import {
  useCreateCustomerForm,
  useUpdateCustomerForm,
} from "@fludge/client/application/customer/form/customer-form";
import { CustomerFormInputs } from "./customer-form-inputs";

type Form =
  | ReturnType<typeof useCreateCustomerForm>
  | ReturnType<typeof useUpdateCustomerForm>;

export function GeneralInformationSection({ form }: { form: Form }) {
  const { t } = useTranslation();

  return (
    <Card className="gap-y-2">
      <Card.Header>
        <Card.Title>{t("forms.customer.sections.general")}</Card.Title>
        <Card.Description>
          {t("forms.customer.sections.general_description")}
        </Card.Description>
      </Card.Header>
      <Separator />
      <Card.Body className="gap-y-3">
        <form.Field name="name">
          {(field) => <CustomerFormInputs.Name field={field} />}
        </form.Field>

        <View className="flex-row items-end gap-x-2">
          <View className="w-1/3">
            <form.Field name="documentType">
              {(field) => <CustomerFormInputs.DocumentType field={field} />}
            </form.Field>
          </View>
          <View className="w-2/3">
            <form.Field name="documentNumber">
              {(field) => <CustomerFormInputs.DocumentNumber field={field} />}
            </form.Field>
          </View>
        </View>
      </Card.Body>
    </Card>
  );
}

export function ContactSection({ form }: { form: Form }) {
  const { t } = useTranslation();

  return (
    <Card className="gap-y-2">
      <Card.Header>
        <Card.Title>{t("forms.customer.sections.contact")}</Card.Title>
        <Card.Description>
          {t("forms.customer.sections.contact_description")}
        </Card.Description>
      </Card.Header>
      <Separator />
      <Card.Body className="gap-y-3">
        <form.Field name="phone">
          {(field) => <CustomerFormInputs.Phone field={field} />}
        </form.Field>
        <form.Field name="email">
          {(field) => <CustomerFormInputs.Email field={field} />}
        </form.Field>
      </Card.Body>
    </Card>
  );
}

export function CreditSection({ form }: { form: Form }) {
  const { t } = useTranslation();

  return (
    <Card className="gap-y-2">
      <Card.Header>
        <Card.Title>{t("forms.customer.sections.credit")}</Card.Title>
        <Card.Description>
          {t("forms.customer.sections.credit_description")}
        </Card.Description>
      </Card.Header>
      <Separator />
      <Card.Body className="gap-y-3">
        <form.Field name="creditLimit">
          {(field) => <CustomerFormInputs.CreditLimit field={field} />}
        </form.Field>
      </Card.Body>
    </Card>
  );
}
