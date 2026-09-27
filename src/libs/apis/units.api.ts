import { getRequest, postRequest, patchRequest, deleteRequest } from "../../utils/helpers/common/http-methods";

export const Units_APIS = {
  create: (body: { name: string }) => postRequest("/v1/units", body),
  getAll: () => getRequest("/v1/units"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/units/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/units/${id}`),
};
