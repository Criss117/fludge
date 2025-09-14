import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { GroupDetail } from "@repo/core/entities/group";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

export async function findOneGroupAction(
  businessId: string,
  groupId: string
): Promise<CommonResponse<GroupDetail | null>> {
  try {
    const res = await api.get<CommonResponse<GroupDetail>>(
      API_ENDPOINTS.BUSINESS.GROUPS.FIND_ONE(businessId, groupId)
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Error al obtener el grupo",
      statusCode: 500,
      error: "Error al obtener el grupo",
    };
  }
}
