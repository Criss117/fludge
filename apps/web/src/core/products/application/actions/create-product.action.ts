import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { ProductFormDto } from "@repo/ui/products/dtos/product-form.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Params = ProductFormDto & {
  businessId: string;
};

export async function createProductAction(
  data: Params
): Promise<CommonResponse<null>> {
  const { businessId, ...rest } = data;

  try {
    const res = await api.post(
      API_ENDPOINTS.BUSINESS.PRODUCTS.CREATE(businessId),
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
