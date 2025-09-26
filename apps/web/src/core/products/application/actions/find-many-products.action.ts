import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import type { ProductSummary } from "@repo/core/entities/product";

type Params = {
  businessId: string;
};

export async function findManyProductsAction({
  businessId,
}: Params): Promise<CommonResponse<ProductSummary[] | null>> {
  try {
    const res = await api.get<CommonResponse<ProductSummary[]>>(
      API_ENDPOINTS.BUSINESS.PRODUCTS.FIND_MANY(businessId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      error: "Algo salió mal al buscar los productos",
      statusCode: 500,
      data: null,
      message: "Algo salió mal al buscar los productos",
    };
  }
}
