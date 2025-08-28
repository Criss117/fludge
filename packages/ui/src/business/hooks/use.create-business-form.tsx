import { useForm, UseFormReturn } from "react-hook-form";
import {
  createBusinessDto as schema,
  type CreateBusinessDto as Schema,
} from "../dtos/create-business.dto";
import { zodResolver } from "@hookform/resolvers/zod";

export function useCreateBusinessForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Pepito Perez",
      nit: "10617376742",
      address: "calle 22 #16-20",
      city: "mercaderes",
    },
  });

  return form;
}

export type CreateBusinessDto = Schema;
export const createBusinessDto = schema;

export type FormType = UseFormReturn<
  CreateBusinessDto,
  unknown,
  CreateBusinessDto
>;
