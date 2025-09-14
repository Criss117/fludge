import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CreateBusinessDto } from "@repo/ui/business/dtos/create-business.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export async function createBusinessAction(data: CreateBusinessDto): Promise<
  CommonResponse<{
    id: string;
  } | null>
> {
  try {
    const res = await api.post<CommonResponse<{ id: string }>>(
      API_ENDPOINTS.BUSINESS.CREATE,
      data
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Error al registrar un negocio",
      statusCode: 500,
      error: "Error al registrar un negocio",
    };
  }
}
