import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Contracts_APIS = {
  create: (body: any) => postRequest("/v1/contracts", body),
  getAll: (params: any = {}) => getRequest("/v1/contracts", params),
  getAllWithoutPagination: () => getRequest("/v1/contracts/all"),
  getById: (id: string) => getRequest(`/v1/contracts/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/contracts/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/contracts/${id}`),
};
