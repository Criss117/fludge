import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { BusinessDetail } from "@repo/core/entities/business";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export async function findOneBusinessAction(
  id: string
): Promise<CommonResponse<BusinessDetail | null>> {
  try {
    const res = await api.get<CommonResponse<BusinessDetail>>(
      API_ENDPOINTS.BUSINESS.FIND_ONE(id)
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Error al obtener perfil",
      statusCode: 500,
      error: "Error al obtener perfil",
    };
  }
}
