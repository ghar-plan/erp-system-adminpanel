import {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";
import { normalizeVariantId } from "../../utils/helpers/models/product-sku";

export const CustomerTypes_APIS = {
  create: (body: any) => postRequest("/v1/customer-types", body),
  getAll: (params: any = {}) => getRequest("/v1/customer-types", params),
  getAllWithoutPagination: (params: any = {}) =>
    getRequest("/v1/customer-types/all", params),
  getById: (id: string) => getRequest(`/v1/customer-types/${id}`),
  update: (id: string, body: any) =>
    patchRequest(`/v1/customer-types/${id}`, body),
  setStatus: (id: string, isActive: boolean) =>
    patchRequest(`/v1/customer-types/${id}/status`, { isActive }),
  delete: (id: string) => deleteRequest(`/v1/customer-types/${id}`),
  getPrices: (id: string, params: any = {}) =>
    getRequest(`/v1/customer-types/${id}/prices`, params),
  upsertPrices: (id: string, body: any) =>
    putRequest(`/v1/customer-types/${id}/prices`, body),
  getProductRate: (id: string, productId: string, variantId?: string | null) =>
    getRequest(`/v1/customer-types/${id}/product-rate`, {
      productId,
      variantId: normalizeVariantId(variantId),
    }),
};
