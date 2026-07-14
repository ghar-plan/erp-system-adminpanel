import { Reports_APIS } from "@/libs/apis/reports.api";

const useReports = () => {
  const getProjectTransactionReport = async (setData: Function, queryParams: any = {}, setTotalElements?: Function) => {
    const response = await Reports_APIS.getProjectTransactionReport(queryParams);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(data.totalElements || 0);
    } else {
      setData({ totalActiveProjects: 0, totalOutflowYTD: 0, recentDisbursements: [] });
      setTotalElements?.(0);
    }
  };

  const getProjects = async (setData: Function) => {
    const response = await Reports_APIS.getProjectsList();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendorReport = async (
    params: any,
    setVendors: Function,
    setTotal: Function,
    setTotalPaymentSum: Function
  ) => {
    const response = await Reports_APIS.getVendorReport(params);
    if (response?.status && response?.data) {
      setVendors(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPaymentSum(response.data.totalPaymentSum || 0);
    } else {
      setVendors([]);
      setTotal(0);
      setTotalPaymentSum(0);
    }
  };

  return {
    getProjectTransactionReport,
    getProjects,
    getVendorReport,
  };
};

export default useReports;
