import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInDto as schema,
  type SignInDto as Schema,
} from "../dtos/sign-in.dto";

export function useSignInForm() {
  const form = useForm<Schema>({
    defaultValues: {
      email: "criscvc12@gmail.com",
      password: "holiwiss",
    },
    resolver: zodResolver(schema),
  });

  return form;
}

export type SignInDto = Schema;
export const signInDto = schema;

export type FormType = UseFormReturn<SignInDto, unknown, SignInDto>;
