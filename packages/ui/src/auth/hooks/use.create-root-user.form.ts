import { useForm, type UseFormReturn } from "react-hook-form";
import {
  createRootUserDto,
  type CreateRootUserDto,
} from "../dtos/create-root-user.dto";
import { zodResolver } from "@hookform/resolvers/zod";

export function useCreateRootUserForm() {
  const form = useForm<CreateRootUserDto>({
    defaultValues: {
      email: "cristian@fludge.dev",
      password: "holiwis",
      username: "criscvc",
      firstName: "cristian",
      lastName: "viveros",
    },
    resolver: zodResolver(createRootUserDto),
  });

  return form;
}

export type FormType = UseFormReturn<
  CreateRootUserDto,
  unknown,
  CreateRootUserDto
>;
