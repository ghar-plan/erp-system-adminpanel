import { Cashflows_APIS } from "@/libs/apis/cashflows.api";
import { Projects_APIS } from "@/libs/apis/projects.api";
import { Vendors_APIS } from "@/libs/apis/vendors.api";
import { Activities_APIS } from "@/libs/apis/activities.api";
import {
  successToaster,
  errorToaster,
} from "@/utils/helpers/common/alert-service";

const useCashflow = () => {
  const getProjects = async (setData: Function) => {
    const response = await Projects_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendors = async (setData: Function) => {
    const response = await Vendors_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getActivities = async (setData: Function) => {
    const response = await Activities_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowInList = async (setData: Function, queryParams: any = {}) => {
    const response = await Cashflows_APIS.getAllIn(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowOutList = async (setData: Function, queryParams: any = {}) => {
    const response = await Cashflows_APIS.getAllOut(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowCombinedList = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Cashflows_APIS.getAllCombined(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const recordCashIn = async (body: any, callback?: Function) => {
    const response = await Cashflows_APIS.createIn(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const recordCashOut = async (body: any, callback?: Function) => {
    const response = await Cashflows_APIS.createOut(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const exportCashflowCsv = async (params: any = {}) => {
    return await Cashflows_APIS.exportCsv(params);
  };

  return {
    getProjects,
    getVendors,
    getActivities,
    getCashflowInList,
    getCashflowOutList,
    getCashflowCombinedList,
    recordCashIn,
    recordCashOut,
    exportCashflowCsv,
  };
};

export default useCashflow;
