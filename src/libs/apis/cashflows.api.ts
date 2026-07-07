import {
  getRequest,
  postRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Cashflows_APIS = {
  createIn: (body: any) => postRequest("/v1/cashflows/in", body),
  createOut: (body: any) => postRequest("/v1/cashflows/out", body),
  getAllIn: (params: any = {}) => getRequest("/v1/cashflows/in", params),
  getAllOut: (params: any = {}) => getRequest("/v1/cashflows/out", params),
  getAllCombined: (params: any = {}) => getRequest("/v1/cashflows", params),
  getProjectListSummary: () => getRequest("/v1/cashflows/project-list"),
  exportCsv: (params: any = {}) => getRequest("/v1/cashflows/export", params),
};
