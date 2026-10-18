import type {
  useCreateCustomerForm,
  useUpdateCustomerForm,
} from "@fludge/client/commerce/forms/customer.form";

import { CustomerFormInputs } from "@/core/commerce/components/customer-form-inputs";
import { SectionCard } from "@/core/shared/components/section-card";

type Form = ReturnType<typeof useCreateCustomerForm> | ReturnType<typeof useUpdateCustomerForm>;

interface Props {
  form: Form;
}

export function GeneralInformationSection({ form }: Props) {
  return (
    <SectionCard
      title="forms.customer.sections.general"
      description="forms.customer.sections.general_description"
    >
      <form.Field name="name">
        {(field) => <CustomerFormInputs.NameInput field={field} />}
      </form.Field>

      <form.Field name="documentType">
        {(field) => <CustomerFormInputs.DocumentTypeInput field={field} />}
      </form.Field>

      <form.Field name="documentNumber">
        {(field) => <CustomerFormInputs.DocumentNumberInput field={field} />}
      </form.Field>
    </SectionCard>
  );
}

export function ContactSection({ form }: Props) {
  return (
    <SectionCard
      title="forms.customer.sections.contact"
      description="forms.customer.sections.contact_description"
    >
      <form.Field name="phone">
        {(field) => <CustomerFormInputs.PhoneInput field={field} />}
      </form.Field>
      <form.Field name="email">
        {(field) => <CustomerFormInputs.EmailInput field={field} />}
      </form.Field>
    </SectionCard>
  );
}

export function CreditSection({ form }: Props) {
  return (
    <SectionCard
      title="forms.customer.sections.credit"
      description="forms.customer.sections.credit_description"
    >
      <form.Field name="creditLimit">
        {(field) => <CustomerFormInputs.CreditLimitInput field={field} />}
      </form.Field>
    </SectionCard>
  );
}
