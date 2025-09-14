import { AxiosError } from "axios";
import api, { API_ENDPOINTS } from "@/core/shared/lib/api";
import type { Permission } from "@repo/core/value-objects/permission";
import type { CommonResponse } from "@repo/ui/utils/reponse";

export async function findAllPermissionsAction(): Promise<
  CommonResponse<Permission[] | null>
> {
  try {
    const res = await api.get<CommonResponse<Permission[]>>(
      API_ENDPOINTS.AUTH.FIND_ALL_PERMISSIONS
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
