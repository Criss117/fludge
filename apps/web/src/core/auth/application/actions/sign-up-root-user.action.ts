import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import type { CreateRootUserDto } from "@repo/ui/auth/dtos/create-root-user.dto";

export async function signUpRootUserAction(
  data: CreateRootUserDto
): Promise<CommonResponse<null>> {
  try {
    const res = await api.post<CommonResponse<null>>(
      API_ENDPOINTS.AUTH.SIGN_UP,
      data
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Error al crear usuario",
      statusCode: 500,
      error: "Error al crear usuario",
    };
  }
}
