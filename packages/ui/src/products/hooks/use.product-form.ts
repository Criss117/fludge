import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ProductFormDto, productFormDto } from "../dtos/product-form.dto";

interface Props {
  defaultValues?: ProductFormDto;
}

export function useProductForm(props?: Props) {
  const form = useForm<ProductFormDto>({
    defaultValues: {
      name: props?.defaultValues?.name ?? "",
      description: props?.defaultValues?.description ?? "",
      allowsNegativeInventory: false,
      barcode: "",
    },
    resolver: zodResolver(productFormDto),
  });

  return form;
}

export type FormType = UseFormReturn<ProductFormDto, unknown, ProductFormDto>;
