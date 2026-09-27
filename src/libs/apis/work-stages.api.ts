import { getRequest, postRequest, patchRequest, deleteRequest } from "../../utils/helpers/common/http-methods";

export const WorkStages_APIS = {
  create: (body: { name: string }) => postRequest("/v1/work-stages", body),
  getAll: () => getRequest("/v1/work-stages"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/work-stages/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/work-stages/${id}`),
};
