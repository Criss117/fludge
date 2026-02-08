import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "node:http";

export class WithAuthHeader {
  headers: Headers;

  constructor(nodeHeaders: IncomingHttpHeaders) {
    this.headers = fromNodeHeaders(nodeHeaders);
  }
}
