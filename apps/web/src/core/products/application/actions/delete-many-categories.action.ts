import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

type Params = {
  businessId: string;
  categoriesIds: string[];
};

export async function deleteManyCategoriesAction(
  data: Params
): Promise<CommonResponse<null>> {
  try {
    const res = await api.delete<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.CATEGORIES.DELETE_MANY(data.businessId),
      {
        data: {
          categoriesIds: data.categoriesIds,
        },
      }
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Algo salió mal al eliminar las categorías",
      statusCode: 500,
      message: "Algo salió mal al eliminar las categorías",
    };
  }
}
