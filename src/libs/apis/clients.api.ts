import { deleteRequest, getRequest } from "../../utils/helpers/common/http-methods";

export const Clients_APIS = {
  getAll: (params: Record<string, unknown> = {}) => getRequest("/v1/clients", params),
  getById: (id: string) => getRequest(`/v1/clients/${id}`),
  delete: (id: string) => deleteRequest(`/v1/clients/${id}`),
};
