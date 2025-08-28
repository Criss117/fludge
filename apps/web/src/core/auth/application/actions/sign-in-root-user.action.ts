import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { SignInDto } from "@repo/ui/auth/hooks/use.sign-in.form";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export async function signInRootUserAction(
  data: SignInDto
): Promise<CommonResponse<string>> {
  try {
    const res = await api.post<CommonResponse<string>>(
      API_ENDPOINTS.AUTH.ROOT_SIGN_IN,
      data
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      message: "Error al crear usuario",
      statusCode: 500,
      error: "Error al crear usuario",
    };
  }
}
