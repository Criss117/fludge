import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ProductFormDto, productFormDto } from "../dtos/product-form.dto";

interface Props {
  defaultValues?: ProductFormDto;
}

export function useProductForm(props?: Props) {
  const form = useForm<ProductFormDto>({
    defaultValues: {
      name: props?.defaultValues?.name,
      description: props?.defaultValues?.description,
      allowsNegativeInventory:
        props?.defaultValues?.allowsNegativeInventory ?? false,
      barcode: props?.defaultValues?.barcode,
      categoryId: props?.defaultValues?.categoryId,
      minStock: props?.defaultValues?.minStock,
      purchasePrice: props?.defaultValues?.purchasePrice,
      salePrice: props?.defaultValues?.salePrice,
      stock: props?.defaultValues?.stock,
      weight: props?.defaultValues?.weight,
      wholesalePrice: props?.defaultValues?.wholesalePrice,
      offerPrice: props?.defaultValues?.offerPrice,
      brandId: props?.defaultValues?.brandId,
      imageUrl: props?.defaultValues?.imageUrl,
    },
    resolver: zodResolver(productFormDto),
  });

  return form;
}

export type FormType = UseFormReturn<ProductFormDto, unknown, ProductFormDto>;
