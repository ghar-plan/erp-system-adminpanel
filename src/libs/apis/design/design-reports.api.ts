import { getRequest } from "../../../utils/helpers/common/http-methods";

export const DesignReports_APIS = {
  getProjectTransactionReport: (params: any = {}) =>
    getRequest("/v1/design/cashflows/project-transaction-report", params),
  getVendorReport: (params: any = {}) =>
    getRequest("/v1/design/vendors/report", params),
  getProjectsList: () => getRequest("/v1/design/projects/all"),
};
