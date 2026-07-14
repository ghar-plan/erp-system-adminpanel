import { Cashflows_APIS } from "@/libs/apis/cashflows.api";
import { Projects_APIS } from "@/libs/apis/projects.api";
import { Vendors_APIS } from "@/libs/apis/vendors.api";
import { Activities_APIS } from "@/libs/apis/activities.api";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useCashflow = () => {
  const getProjects = async (setData: Function) => {
    const response = await Projects_APIS.getAll({ limit: 100 });
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendors = async (setData: Function) => {
    const response = await Vendors_APIS.getAll({ limit: 100 });
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getActivities = async (setData: Function) => {
    const response = await Activities_APIS.getAll({ limit: 100 });
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

  const deleteCashflow = async (
    id: string,
    type: "CASH IN" | "CASH OUT",
    label: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete ${type}`,
      `Are you sure you want to delete "${label}"? This action cannot be undone.`,
    );
    if (result.isConfirmed) {
      const response =
        type === "CASH IN"
          ? await Cashflows_APIS.deleteIn(id)
          : await Cashflows_APIS.deleteOut(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
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
    recordCashIn,
    recordCashOut,
    deleteCashflow,
    exportCashflowCsv,
  };
};

export default useCashflow;
