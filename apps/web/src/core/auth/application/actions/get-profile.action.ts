import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { LogedUser } from "@repo/core/entities/user";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

export async function getProfileAction(
  jwt: string
): Promise<CommonResponse<LogedUser | null>> {
  try {
    const res = await api.get<CommonResponse<LogedUser>>(
      API_ENDPOINTS.AUTH.GET_PROFILE,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      message: "Error al obtener perfil",
      statusCode: 500,
      error: "Error al obtener perfil",
    };
  }
}
