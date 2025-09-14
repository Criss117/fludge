import { HttpStatus } from "./http-status";

export interface CommonResponse<T> {
  data: T;
  statusCode: HttpStatus;
  message: string;
  error?: string;
}
