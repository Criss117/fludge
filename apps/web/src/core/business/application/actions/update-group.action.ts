import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { UpdateGroupDto } from "@repo/ui/business/dtos/update-group.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

interface Data {
  businessId: string;
  groupId: string;
  data: UpdateGroupDto;
}

export async function updateGroupAction({
  businessId,
  data,
  groupId,
}: Data): Promise<CommonResponse<null>> {
  try {
    const res = await api.patch<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.GROUPS.UPDATE(businessId, groupId),
      data
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.response?.data;
    }

    return {
      data: null,
      message: "Error al actualizar el grupo",
      statusCode: 500,
      error: "Error al actualizar el grupo",
    };
  }
}
