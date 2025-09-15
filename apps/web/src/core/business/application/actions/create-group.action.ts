import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CreateGroupDto } from "@repo/ui/business/dtos/create-group.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Data = CreateGroupDto & { businessId: string };

export async function createGroupAction(
  data: Data
): Promise<CommonResponse<null>> {
  const { businessId, ...rest } = data;

  try {
    const res = await api.post<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.GROUPS.CREATE(businessId),
      rest
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Error al registrar un grupo",
      statusCode: 500,
      error: "Error al registrar un grupo",
    };
  }
}
