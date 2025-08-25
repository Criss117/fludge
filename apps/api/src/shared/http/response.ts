import { HttpStatus } from '@nestjs/common';

export interface CommonResponse<T> {
  data?: T;
  statusCode: HttpStatus;
  message: string;
  error?: string;
}

export class HTTPResponse<T> {
  private data?: T;
  private statusCode: HttpStatus;
  private message: string;
  private error?: string;

  constructor(
    data: T,
    statusCode: HttpStatus,
    message: string,
    error?: string,
  ) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }

  public static ok<T>(data: T) {
    return new HTTPResponse<T>(data, HttpStatus.OK, 'Ok');
  }

  public static created<T>(data: T) {
    return new HTTPResponse<T>(data, HttpStatus.CREATED, 'Created');
  }

  public static noContent() {
    return new HTTPResponse<void>(
      undefined,
      HttpStatus.NO_CONTENT,
      'No Content',
    );
  }
}
