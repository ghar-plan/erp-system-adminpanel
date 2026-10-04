import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignWorkStages_APIS = {
  create: (body: { name: string }) => postRequest("/v1/design/work-stages", body),
  getAll: () => getRequest("/v1/design/work-stages"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/design/work-stages/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/work-stages/${id}`),
};
