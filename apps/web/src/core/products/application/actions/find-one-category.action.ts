import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CategoryDetail } from "@repo/core/entities/category";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export async function findOneCategoryAction(
  businessId: string,
  categoryId: string
): Promise<CommonResponse<CategoryDetail | null>> {
  try {
    const res = await api.get<CommonResponse<CategoryDetail>>(
      API_ENDPOINTS.BUSINESS.CATEGORIES.FIND_ONE(businessId, categoryId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al obtener la categoría",
      message: "Error al obtener la categoría",
      statusCode: 500,
    };
  }
}
