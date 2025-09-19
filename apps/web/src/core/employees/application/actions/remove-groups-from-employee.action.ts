import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

type Params = {
  businessId: string;
  employeeId: string;
  groupIds: string[];
};

export async function removeGroupsFromEmployeeAction(
  data: Params
): Promise<CommonResponse<null>> {
  try {
    const res = await api.delete<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.EMPLOYEES.REMOVE_GROUPS(
        data.businessId,
        data.employeeId
      ),
      {
        data: {
          groupIds: data.groupIds,
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
