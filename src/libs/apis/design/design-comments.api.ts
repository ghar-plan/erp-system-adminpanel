import {
  deleteRequest,
  getRequest,
  getRequestSilent,
  patchRequest,
  postRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignComments_APIS = {
  getAll: (params: { projectId: string; offset?: number; limit?: number }) =>
    getRequest("/v1/design/comments", params),
  getAllSilent: (params: { projectId: string; offset?: number; limit?: number }) =>
    getRequestSilent("/v1/design/comments", params),
  create: (body: { projectId: string; message: string }) =>
    postRequest("/v1/design/comments", body),
  update: (id: string, body: { message: string }) =>
    patchRequest(`/v1/design/comments/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/comments/${id}`),
};
