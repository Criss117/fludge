import { useForm, type UseFormReturn } from "react-hook-form";
import {
  createRootUserDto as schema,
  type CreateRootUserDto as Schema,
} from "../dtos/create-root-user.dto";
import { zodResolver } from "@hookform/resolvers/zod";

export function useCreateRootUserForm() {
  const form = useForm<Schema>({
    defaultValues: {
      email: "criscvc12@gmail.com",
      password: "holiwiss",
      username: "criscvc",
      firstName: "cristian",
      lastName: "viveros",
    },
    resolver: zodResolver(schema),
  });

  return form;
}

export type CreateRootUserDto = Schema;
export const createRootUserDto = schema;

export type FormType = UseFormReturn<
  CreateRootUserDto,
  unknown,
  CreateRootUserDto
>;
