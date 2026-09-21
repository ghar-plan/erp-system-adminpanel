import { getRequest, postRequest, patchRequest, deleteRequest } from "../../utils/helpers/common/http-methods";

export const Jobs_APIS = {
  create: (body: { name: string }) => postRequest("/v1/jobs", body),
  getAll: () => getRequest("/v1/jobs"),
  update: (id: string, body: { name: string }) => patchRequest(`/v1/jobs/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/jobs/${id}`),
};
