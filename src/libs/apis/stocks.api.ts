import { getRequest } from "../../utils/helpers/common/http-methods";

export const Stocks_APIS = {
  getAll: (params: any = {}) => getRequest("/v1/stocks", params),
  getByProduct: (productId: string) =>
    getRequest(`/v1/stocks/product/${productId}`),
};
