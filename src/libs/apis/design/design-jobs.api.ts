import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignJobs_APIS = {
  create: (body: { name: string }) => postRequest("/v1/design/jobs", body),
  getAll: () => getRequest("/v1/design/jobs"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/design/jobs/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/jobs/${id}`),
};
