import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { CreateEmployeeDto } from "@repo/ui/employees/dtos/create-employee.dto";
import type { CommonResponse } from "@repo/ui/utils/reponse";
import { AxiosError } from "axios";

type Data = {
  businessId: string;
  data: CreateEmployeeDto;
};

export async function createEmployeeAction({
  businessId,
  data,
}: Data): Promise<CommonResponse<null>> {
  try {
    const res = await api.post<CommonResponse<null>>(
      API_ENDPOINTS.BUSINESS.EMPLOYEES.CREATE(businessId),
      data
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }

    return {
      data: null,
      error: "Error al crear empleado",
      message: "Error al crear empleado",
      statusCode: 500,
    };
  }
}
