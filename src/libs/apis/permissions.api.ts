import {
  getRequest,
  patchRequest,
} from "../../utils/helpers/common/http-methods";

export const Permissions_APIS = {
  getAll: (params?: Record<string, unknown>) =>
    getRequest("/v1/roles/permissions", params),
  setStatus: (id: string, status: boolean) =>
    patchRequest(`/v1/roles/permissions/${id}/status`, { status }),
};
