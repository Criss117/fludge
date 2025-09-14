import { useForm, type UseFormReturn } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupDto, CreateGroupDto } from "../dtos/create-group.dto";

export function useCreateBusinessForm() {
  const form = useForm<CreateGroupDto>({
    resolver: zodResolver(createGroupDto),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  return form;
}
export type FormType = UseFormReturn<CreateGroupDto, unknown, CreateGroupDto>;
