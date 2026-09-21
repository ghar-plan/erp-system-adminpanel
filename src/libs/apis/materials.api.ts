import { getRequest, postRequest, patchRequest, deleteRequest } from "../../utils/helpers/common/http-methods";

export const Materials_APIS = {
  create: (body: { name: string }) => postRequest("/v1/materials", body),
  getAll: () => getRequest("/v1/materials"),
  update: (id: string, body: { name: string }) => patchRequest(`/v1/materials/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/materials/${id}`),
};
