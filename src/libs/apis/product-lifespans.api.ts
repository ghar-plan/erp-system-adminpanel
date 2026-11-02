import {
  getRequest,
  putRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";
import { normalizeVariantId } from "../../utils/helpers/models/product-sku";

const variantParams = (variantId?: string | null) => ({
  variantId: normalizeVariantId(variantId),
});

export const ProductLifespans_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/product-lifespans", params),
  getMap: () => getRequest("/v1/product-lifespans/map"),
  getByProduct: (productId: string, variantId?: string | null) =>
    getRequest(
      `/v1/product-lifespans/product/${productId}`,
      variantParams(variantId),
    ),
  upsert: (body: any) => putRequest("/v1/product-lifespans", body),
  clear: (productId: string, variantId?: string | null) =>
    deleteRequest(
      `/v1/product-lifespans/product/${productId}`,
      variantParams(variantId),
    ),
};
