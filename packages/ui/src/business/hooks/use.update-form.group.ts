import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateGroupDto, type UpdateGroupDto } from "../dtos/update-group.dto";

interface Props {
  defaultValues: UpdateGroupDto;
}

export function useUpdateGroupForm({ defaultValues }: Props) {
  const form = useForm<UpdateGroupDto>({
    defaultValues,
    resolver: zodResolver(updateGroupDto),
  });

  return form;
}

export type FormType = UseFormReturn<UpdateGroupDto, unknown, UpdateGroupDto>;
