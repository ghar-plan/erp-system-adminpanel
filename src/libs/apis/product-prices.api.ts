import {
  getRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const ProductPrices_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/product-prices", params),
  getMap: () => getRequest("/v1/product-prices/map"),
  getByProduct: (productId: string) =>
    getRequest(`/v1/product-prices/product/${productId}`),
  getHistory: (productId: string) =>
    getRequest(`/v1/product-prices/product/${productId}/history`),
  upsert: (body: any) => putRequest("/v1/product-prices", body),
  clear: (productId: string) =>
    deleteRequest(`/v1/product-prices/product/${productId}`),
};
