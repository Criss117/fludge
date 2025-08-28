import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

export async function findOneBusinessAction(
  id: string
): Promise<CommonResponse<unknown>> {
  try {
    const res = await api.get<CommonResponse<unknown>>(
      API_ENDPOINTS.BUSINESS.FIND_ONE(id)
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
