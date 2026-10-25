import { ProductFormScreen } from "@/core/catalog/screens/product-form";

export default function CreateProduct() {
  return <ProductFormScreen action={{ type: "create" }} />;
}
