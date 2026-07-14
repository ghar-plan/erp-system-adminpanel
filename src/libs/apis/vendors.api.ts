import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Vendors_APIS = {
  create: (body: any) => postRequest("/v1/vendors", body),
  getAll: (params: any = {}) => getRequest("/v1/vendors", params),
  getAllWithoutPagination: () => getRequest("/v1/vendors/all"),
  getById: (id: string) => getRequest(`/v1/vendors/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/vendors/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/vendors/${id}`),
  getPaymentSummary: (params: any = {}) =>
    getRequest("/v1/vendors/payment-summary", params),
};
