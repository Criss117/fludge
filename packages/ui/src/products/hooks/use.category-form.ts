import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategoryDto,
  type CreateCategoryDto,
} from "../dtos/create-category.dto";

interface Props {
  defaultValues?: CreateCategoryDto;
}

export function useCategoryForm(props?: Props) {
  const form = useForm<CreateCategoryDto>({
    defaultValues: {
      name: props?.defaultValues?.name ?? "",
      description: props?.defaultValues?.description ?? "",
    },
    resolver: zodResolver(createCategoryDto),
  });

  return form;
}

export type FormType = UseFormReturn<
  CreateCategoryDto,
  unknown,
  CreateCategoryDto
>;
