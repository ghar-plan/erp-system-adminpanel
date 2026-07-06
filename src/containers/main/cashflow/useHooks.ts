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

  const getCashflowInList = async (setData: Function) => {
    const response = await Cashflows_APIS.getAllIn();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowOutList = async (setData: Function) => {
    const response = await Cashflows_APIS.getAllOut();
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

  return {
    getProjects,
    getVendors,
    getActivities,
    getCashflowInList,
    getCashflowOutList,
    recordCashIn,
    recordCashOut,
  };
};

export default useCashflow;
