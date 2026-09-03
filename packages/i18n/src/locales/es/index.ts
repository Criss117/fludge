import { api_errors } from "./api-errors";
import { app } from "./app";
import { forms } from "./forms";
import { helpers } from "./helpers";
import { mutations } from "./mutations";
import { permissions } from "./permissions";
import { resources } from "./resources";
import { screens } from "./screens";
import { validators } from "./validators";

export const es = {
  app,
  api_errors,
  validators,
  forms,
  screens,
  permissions,
  resources,
  helpers,
  mutations,
} as const;
