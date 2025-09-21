import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategoryDto,
  type CreateCategoryDto,
} from "../dtos/create-category.dto";

export function useCreateCategoryForm() {
  const form = useForm<CreateCategoryDto>({
    defaultValues: {
      name: "",
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
