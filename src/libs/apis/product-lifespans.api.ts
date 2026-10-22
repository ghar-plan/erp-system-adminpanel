import {
  getRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const ProductLifespans_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/product-lifespans", params),
  getMap: () => getRequest("/v1/product-lifespans/map"),
  getByProduct: (productId: string) =>
    getRequest(`/v1/product-lifespans/product/${productId}`),
  upsert: (body: any) => putRequest("/v1/product-lifespans", body),
  clear: (productId: string) =>
    deleteRequest(`/v1/product-lifespans/product/${productId}`),
};
