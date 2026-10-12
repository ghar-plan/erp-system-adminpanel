import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Purchases_APIS = {
  create: (body: any) => postRequest("/v1/purchases", body),
  getAll: (params: any = {}) => getRequest("/v1/purchases", params),
  getById: (id: string) => getRequest(`/v1/purchases/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/purchases/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/purchases/${id}`),
};
