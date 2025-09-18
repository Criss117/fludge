import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

type Params = {
  businessId: string;
  groupId: string;
  employeeIds: string[];
};

export async function removeEmployeesToGroupAction({
  businessId,
  employeeIds,
  groupId,
}: Params): Promise<CommonResponse<null>> {
  try {
    const res = await api.delete<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.GROUPS.REMOVE_EMPLOYEES(businessId, groupId),
      {
        data: {
          employeeIds,
        },
      }
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      message: "Something went wrong",
      statusCode: 500,
      error: "Something went wrong",
    };
  }
}
