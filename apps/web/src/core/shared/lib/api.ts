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
      UPDATE: (businessId: string, groupId: string) =>
        `/business/${businessId}/groups/${groupId}` as `/business/${string}/groups/${string}`,
      ASSIGN_EMPLOYEES: (businessId: string, groupId: string) =>
        `/business/${businessId}/groups/${groupId}/employees` as `/business/${string}/groups/${string}/employees`,
      REMOVE_EMPLOYEES: (businessId: string, groupId: string) =>
        `/business/${businessId}/groups/${groupId}/employees` as `/business/${string}/groups/${string}/employees`,
    },
    EMPLOYEES: {
      CREATE: (businessId: string) =>
        `/business/${businessId}/employees` as `/business/${string}/employees`,
      FIND_ONE: (businessId: string, employeeId: string) =>
        `/business/${businessId}/employees/${employeeId}` as `/business/${string}/employees/${string}`,
      ASSIGN_GROUPS: (businessId: string, employeeId: string) =>
        `/business/${businessId}/employees/${employeeId}/groups` as `/business/${string}/employees/${string}/groups`,
      REMOVE_GROUPS: (businessId: string, employee: string) =>
        `/business/${businessId}/employees/${employee}/groups` as `/business/${string}/employees/${string}/groups`,
    },
    CATEGORIES: {
      FIND_MANY: (businessId: string) =>
        `/business/${businessId}/categories` as `/business/${string}/categories`,
      FIND_ONE: (businessId: string, categoryId: string) =>
        `/business/${businessId}/categories/${categoryId}` as `/business/${string}/categories/${string}`,
      CREATE: (businessId: string) =>
        `/business/${businessId}/categories` as `/business/${string}/categories`,
      DELETE_MANY: (businessId: string) =>
        `/business/${businessId}/categories/delete-many` as `/business/${string}/categories/delete-many`,
      UPDATE: (businessId: string, categoryId: string) =>
        `/business/${businessId}/categories/${categoryId}` as `/business/${string}/categories/${string}`,
    },
    PRODUCTS: {
      FIND_MANY: (businessId: string) =>
        `/business/${businessId}/products` as `/business/${string}/products`,
      CREATE: (businessId: string) =>
        `/business/${businessId}/products` as `/business/${string}/products`,
      FIND_ONE: (businessId: string, productId: string) =>
        `/business/${businessId}/products/${productId}` as `/business/${string}/products/${string}`,
    },
  },
} as const;

export default api;
