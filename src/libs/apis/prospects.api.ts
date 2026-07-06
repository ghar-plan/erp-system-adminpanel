import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Prospects_APIS = {
  create: (body: any) => postRequest("/v1/prospects", body),
  getAll: (params: any = {}) => getRequest("/v1/prospects", params),
  getById: (id: string) => getRequest(`/v1/prospects/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/prospects/${id}`, body),
  updateStatus: (id: string, status: string) =>
    patchRequest(`/v1/prospects/${id}/status`, { status }),
  delete: (id: string) => deleteRequest(`/v1/prospects/${id}`),
};
