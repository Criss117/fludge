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
    GET_PROFILE: "/auth/profile",
  },
  BUSINESS: {
    FIND_ONE: (id: string) => `/business/${id}` as `/business/${string}`,
    CREATE: "/business",
  },
} as const;

export default api;
