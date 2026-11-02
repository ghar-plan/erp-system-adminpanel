import { getRequest } from "../../utils/helpers/common/http-methods";

export const Gharplans_APIS = {
  getProducts: (params: any = {}) =>
    getRequest("/v1/gharplans/products", params),
  getProductById: (id: string) => getRequest(`/v1/gharplans/products/${id}`),
  getBrands: () => getRequest("/v1/gharplans/brands"),
  getPickupPoints: () => getRequest("/v1/gharplans/pickup-points"),
};
