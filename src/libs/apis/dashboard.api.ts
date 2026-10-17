import { getRequest } from "../../utils/helpers/common/http-methods";

export const Dashboard_APIS = {
  getStats: () => getRequest("/v1/dashboard/stats"),
  getAnalytics: (params: { startDate?: string; endDate?: string } = {}) =>
    getRequest("/v1/dashboard/analytics", params),
};
