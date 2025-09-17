import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { EmployeeDetail } from "@repo/core/entities/user";
import type { CommonResponse } from "@repo/ui/utils/reponse";

type Meta = {
  businessId: string;
  employeeId: string;
};

export async function findOneEmployeeAction(
  meta: Meta
): Promise<CommonResponse<EmployeeDetail | null>> {
  try {
    const res = await api.get<CommonResponse<EmployeeDetail>>(
      API_ENDPOINTS.BUSINESS.EMPLOYEES.FIND_ONE(
        meta.businessId,
        meta.employeeId
      )
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al obtener empleado",
      message: "Error al obtener empleado",
      statusCode: 500,
    };
  }
}
