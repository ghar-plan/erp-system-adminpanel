import { getRequest } from "../../utils/helpers/common/http-methods";

export const Gharplans_APIS = {
  getProducts: (params: any = {}) =>
    getRequest("/v1/gharplans/products", params),
  getPickupPoints: () => getRequest("/v1/gharplans/pickup-points"),
};
