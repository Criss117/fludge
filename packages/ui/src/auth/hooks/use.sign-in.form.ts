import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInDto, type SignInDto } from "../dtos/sign-in.dto";

export function useSignInForm() {
  const form = useForm<SignInDto>({
    defaultValues: {
      email: "",
      password: "holiwis",
    },
    resolver: zodResolver(signInDto),
  });

  return form;
}

export type FormType = UseFormReturn<SignInDto, unknown, SignInDto>;
