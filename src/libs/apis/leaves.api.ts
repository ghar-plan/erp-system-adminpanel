import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Leaves_APIS = {
  create: (body: { startDate: string; endDate: string; reason: string }) =>
    postRequest("/v1/leaves", body),
  getMine: (params: any = {}) => getRequest("/v1/leaves/me", params),
  getAll: (params: any = {}) => getRequest("/v1/leaves", params),
  getById: (id: string) => getRequest(`/v1/leaves/${id}`),
  approve: (id: string, note?: string) =>
    patchRequest(`/v1/leaves/${id}/approve`, note ? { note } : {}),
  reject: (id: string, note?: string) =>
    patchRequest(`/v1/leaves/${id}/reject`, note ? { note } : {}),
  cancel: (id: string) => patchRequest(`/v1/leaves/${id}/cancel`, {}),
  delete: (id: string) => deleteRequest(`/v1/leaves/${id}`),
};
