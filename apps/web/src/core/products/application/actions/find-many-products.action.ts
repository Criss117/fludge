import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type {
  CommonResponse,
  PaginationResponse,
} from "@repo/ui/utils/reponse";
import type { ProductSummary } from "@repo/core/entities/product";

type Params = {
  businessId: string;
  limit?: number;
  page?: number;
};

export async function findManyProductsAction({
  businessId,
  limit,
  page,
}: Params): Promise<CommonResponse<PaginationResponse<ProductSummary> | null>> {
  try {
    const res = await api.get<
      CommonResponse<PaginationResponse<ProductSummary>>
    >(API_ENDPOINTS.BUSINESS.PRODUCTS.FIND_MANY(businessId), {
      params: {
        limit,
        page,
      },
    });

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
