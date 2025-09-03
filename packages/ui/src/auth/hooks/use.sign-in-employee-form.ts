import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInEmployeeDto, signInEmployeeDto } from "../dtos/sign-in.dto";

export function useSignInEmployeeForm() {
  const form = useForm<SignInEmployeeDto>({
    resolver: zodResolver(signInEmployeeDto),
    defaultValues: {
      username: "",
      password: "holiwis",
    },
  });

  return form;
}

export type FormType = ReturnType<typeof useSignInEmployeeForm>;
