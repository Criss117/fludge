import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

export type AssignEmployeesToGroupDto = {
  employeeIds: string[];
  groupId: string;
  businessId: string;
};

export async function assignEmployeesToGroupAction({
  businessId,
  employeeIds,
  groupId,
}: AssignEmployeesToGroupDto): Promise<CommonResponse<null>> {
  try {
    const res = await api.post<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.GROUPS.ASSIGN_EMPLOYEES(businessId, groupId),
      {
        employeeIds,
      }
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
