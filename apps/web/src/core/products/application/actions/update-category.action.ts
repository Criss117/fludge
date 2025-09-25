import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CreateCategoryDto } from "@repo/ui/products/dtos/create-category.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Params = CreateCategoryDto & {
  businessId: string;
  categoryId: string;
};

export async function updateCategoryAction(
  data: Params
): Promise<CommonResponse<null>> {
  const { businessId, categoryId, ...rest } = data;

  try {
    const res = await api.patch(
      API_ENDPOINTS.BUSINESS.CATEGORIES.UPDATE(businessId, categoryId),
      rest
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al actualizar la categoría",
      statusCode: 500,
      message: "Error al actualizar la categoría",
    };
  }
}
