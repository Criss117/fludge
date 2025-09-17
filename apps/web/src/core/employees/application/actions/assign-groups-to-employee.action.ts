import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export type AssignGroupsToEmployeeAction = {
  businessId: string;
  employeeId: string;
  groupIds: string[];
};

export async function assignGroupsToEmployeeAction({
  businessId,
  employeeId,
  groupIds,
}: AssignGroupsToEmployeeAction): Promise<CommonResponse<null>> {
  try {
    const res = await api.post<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.EMPLOYEES.ASSIGN_GROUPS(businessId, employeeId),
      { groupIds }
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    throw error;
  }
}
