import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { SignInEmployeeDto } from "@repo/ui/auth/dtos/sign-in.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

export async function signInEmployeeUserAction(
  data: SignInEmployeeDto
): Promise<CommonResponse<string>> {
  try {
    const res = await api.post<CommonResponse<string>>(
      API_ENDPOINTS.AUTH.EMPLOYEE_SIGN_IN,
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
