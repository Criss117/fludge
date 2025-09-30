import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Params = {
  businessId: string;
  productId: string;
};

export async function deleteProductAction({
  businessId,
  productId,
}: Params): Promise<CommonResponse<null>> {
  try {
    const res = await api.delete(
      API_ENDPOINTS.BUSINESS.PRODUCTS.DELETE(businessId, productId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Algo salió mal al eliminar el producto",
      message: "Algo salió mal al eliminar el producto",
      statusCode: 500,
    };
  }
}
