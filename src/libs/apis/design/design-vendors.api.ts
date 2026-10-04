import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignVendors_APIS = {
  create: (body: any) => postRequest("/v1/design/vendors", body),
  getAll: (params: any = {}) => getRequest("/v1/design/vendors", params),
  getAllWithoutPagination: () => getRequest("/v1/design/vendors/all"),
  getFilterOptions: () => getRequest("/v1/design/vendors/filter-options"),
  getById: (id: string) => getRequest(`/v1/design/vendors/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/design/vendors/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/vendors/${id}`),
  getPaymentSummary: (params: any = {}) =>
    getRequest("/v1/design/vendors/payment-summary", params),
  getReport: (params: any = {}) => getRequest("/v1/design/vendors/report", params),
};
