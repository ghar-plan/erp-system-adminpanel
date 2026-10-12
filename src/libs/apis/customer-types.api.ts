import {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const CustomerTypes_APIS = {
  create: (body: any) => postRequest("/v1/customer-types", body),
  getAll: (params: any = {}) => getRequest("/v1/customer-types", params),
  getAllWithoutPagination: () => getRequest("/v1/customer-types/all"),
  getById: (id: string) => getRequest(`/v1/customer-types/${id}`),
  update: (id: string, body: any) =>
    patchRequest(`/v1/customer-types/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/customer-types/${id}`),
  getPrices: (id: string, params: any = {}) =>
    getRequest(`/v1/customer-types/${id}/prices`, params),
  upsertPrices: (id: string, body: any) =>
    putRequest(`/v1/customer-types/${id}/prices`, body),
  getProductRate: (id: string, productId: string) =>
    getRequest(`/v1/customer-types/${id}/product-rate`, { productId }),
};
