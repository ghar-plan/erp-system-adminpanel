import { getRequest } from "../../utils/helpers/common/http-methods";

export const Reports_APIS = {
  getProjectTransactionReport: (params: any = {}) =>
    getRequest("/v1/cashflows/project-transaction-report", params),
  getVendorReport: (params: any = {}) =>
    getRequest("/v1/vendors/report", params),
  getProjectsList: () => getRequest("/v1/projects/all"),
};
