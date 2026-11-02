import {
  getRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";
import { normalizeVariantId } from "../../utils/helpers/models/product-sku";

const variantParams = (variantId?: string | null) => ({
  variantId: normalizeVariantId(variantId),
});

export const ProductPrices_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/product-prices", params),
  getMap: () => getRequest("/v1/product-prices/map"),
  getByProduct: (productId: string, variantId?: string | null) =>
    getRequest(
      `/v1/product-prices/product/${productId}`,
      variantParams(variantId),
    ),
  getHistory: (productId: string, variantId?: string | null) =>
    getRequest(
      `/v1/product-prices/product/${productId}/history`,
      variantParams(variantId),
    ),
  upsert: (body: any) => putRequest("/v1/product-prices", body),
  clear: (productId: string, variantId?: string | null) =>
    deleteRequest(
      `/v1/product-prices/product/${productId}`,
      variantParams(variantId),
    ),
};
