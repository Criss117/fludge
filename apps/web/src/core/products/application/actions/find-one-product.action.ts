import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { ProductDetail } from "@repo/core/entities/product";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Params = {
  businessId: string;
  productId: string;
};

export async function findOneProductAction({
  businessId,
  productId,
}: Params): Promise<CommonResponse<ProductDetail | null>> {
  try {
    const res = await api.get<CommonResponse<ProductDetail>>(
      API_ENDPOINTS.BUSINESS.PRODUCTS.FIND_ONE(businessId, productId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      error: "Algo salió mal al buscar el producto",
      message: "Algo salió mal al buscar el producto",
      data: null,
      statusCode: 500,
    };
  }
}
