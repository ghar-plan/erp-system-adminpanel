import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Sales_APIS = {
  create: (body: any) => postRequest("/v1/sales", body),
  getAll: (params: any = {}) => getRequest("/v1/sales", params),
  getSummary: (params: any = {}) => getRequest("/v1/sales/summary", params),
  getLedger: (params: any = {}) => getRequest("/v1/sales/ledger", params),
  getById: (id: string) => getRequest(`/v1/sales/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/sales/${id}`, body),
  post: (id: string, body: any = {}) =>
    postRequest(`/v1/sales/${id}/post`, body),
  delete: (id: string) => deleteRequest(`/v1/sales/${id}`),
  recordInstallment: (id: string, body: any) =>
    postRequest(`/v1/sales/${id}/installments`, body),
  getInstallments: (id: string) =>
    getRequest(`/v1/sales/${id}/installments`),
};
