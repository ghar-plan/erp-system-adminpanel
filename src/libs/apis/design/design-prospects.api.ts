import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignProspects_APIS = {
  create: (body: any) => postRequest("/v1/design/prospects", body),
  getAll: (params: any = {}) => getRequest("/v1/design/prospects", params),
  getById: (id: string) => getRequest(`/v1/design/prospects/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/design/prospects/${id}`, body),
  updateStatus: (id: string, status: string) =>
    patchRequest(`/v1/design/prospects/${id}/status`, { status }),
  delete: (id: string) => deleteRequest(`/v1/design/prospects/${id}`),
};
