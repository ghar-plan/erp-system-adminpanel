import { getRequest } from "../../utils/helpers/common/http-methods";
import { normalizeVariantId } from "../../utils/helpers/models/product-sku";

const variantParams = (variantId?: string | null) => ({
  variantId: normalizeVariantId(variantId),
});

export const Stocks_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/stocks", params),
  getByProduct: (productId: string, variantId?: string | null) =>
    getRequest(`/v1/stocks/product/${productId}`, variantParams(variantId)),
  getBatchesByProduct: (productId: string, variantId?: string | null) =>
    getRequest(
      `/v1/stocks/product/${productId}/batches`,
      variantParams(variantId),
    ),
};
