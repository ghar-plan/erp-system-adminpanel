import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const PurchaseSuppliers_APIS = {
  create: (body: { name: string }) =>
    postRequest("/v1/purchase-suppliers", body),
  getAll: () => getRequest("/v1/purchase-suppliers"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/purchase-suppliers/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/purchase-suppliers/${id}`),
};
