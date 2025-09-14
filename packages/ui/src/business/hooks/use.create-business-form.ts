import { useForm, type UseFormReturn } from "react-hook-form";
import {
  createBusinessDto,
  type CreateBusinessDto,
} from "../dtos/create-business.dto";
import { zodResolver } from "@hookform/resolvers/zod";

export function useCreateBusinessForm() {
  const form = useForm<CreateBusinessDto>({
    resolver: zodResolver(createBusinessDto),
    defaultValues: {
      name: "",
      nit: "",
      address: "",
      city: "",
    },
  });

  return form;
}
export type FormType = UseFormReturn<
  CreateBusinessDto,
  unknown,
  CreateBusinessDto
>;
