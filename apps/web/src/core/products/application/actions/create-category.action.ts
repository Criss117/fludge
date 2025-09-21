import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CreateCategoryDto } from "@repo/ui/products/dtos/create-category.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

type Params = CreateCategoryDto & {
  businessId: string;
  parentId?: string;
};

export async function createCategoryAction(
  data: Params
): Promise<CommonResponse<null>> {
  const { businessId, ...rest } = data;

  try {
    const res = await api.post(
      API_ENDPOINTS.BUSINESS.CATEGORIES.CREATE(businessId),
      rest
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al crear la categoría",
      statusCode: 500,
      message: "Error al crear la categoría",
    };
  }
}
