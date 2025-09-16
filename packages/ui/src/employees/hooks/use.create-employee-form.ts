import { useForm, type UseFormReturn } from "react-hook-form";
import {
  createEmployeeDto,
  type CreateEmployeeDto,
} from "../dtos/create-employee.dto";
import { zodResolver } from "@hookform/resolvers/zod";

export function useCreateEmployeeForm() {
  const form = useForm<CreateEmployeeDto>({
    defaultValues: {
      password: "",
      username: "",
      firstName: "",
      lastName: "",
      groupIds: [],
    },
    resolver: zodResolver(createEmployeeDto),
  });

  return form;
}

export type FormType = UseFormReturn<
  CreateEmployeeDto,
  unknown,
  CreateEmployeeDto
>;
