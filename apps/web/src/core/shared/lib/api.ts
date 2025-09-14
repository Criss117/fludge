import axios from "axios";
import { config as envConfig } from "./config";

const api = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(envConfig.tokenKey.toString());

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: "/auth/sign-up",
    ROOT_SIGN_IN: "/auth/sign-in",
    EMPLOYEE_SIGN_IN: "/auth/sign-in-employee",
    GET_PROFILE: "/auth/profile",
    FIND_ALL_PERMISSIONS: "/auth/permissions",
  },
  BUSINESS: {
    FIND_ONE: (id: string) => `/business/${id}` as `/business/${string}`,
    CREATE: "/business",
    GROUPS: {
      FIND_ONE: (businessId: string, groupId: string) =>
        `/business/${businessId}/groups/${groupId}` as `/business/${string}/groups/${string}`,
      CREATE: (businessId: string) =>
        `/business/${businessId}/groups` as `/business/${string}/groups`,
      ASSIGN_EMPLOYEES: (businessId: string, groupId: string) =>
        `/business/${businessId}/groups/${groupId}/assign-employees` as `/business/${string}/groups/${string}/assign-employees`,
    },
  },
} as const;

export default api;
