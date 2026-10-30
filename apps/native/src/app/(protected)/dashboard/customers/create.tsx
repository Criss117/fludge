import { CustomerFormScreen } from "@/core/commerce/screens/customer-form";

export default function CustomerCreate() {
  return <CustomerFormScreen action={{ type: "create" }} />;
}
