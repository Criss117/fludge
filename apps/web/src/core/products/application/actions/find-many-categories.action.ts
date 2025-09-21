import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import type { CategorySummary } from "@repo/core/entities/category";
import { AxiosError } from "axios";

export async function findManyCategoriesAction(
  businessId: string
): Promise<CommonResponse<CategorySummary[] | null>> {
  try {
    const res = await api.get<CommonResponse<CategorySummary[]>>(
      API_ENDPOINTS.BUSINESS.CATEGORIES.FIND_MANY(businessId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al obtener las categorías",
      message: "Error al obtener las categorías",
      statusCode: 500,
    };
  }
}
