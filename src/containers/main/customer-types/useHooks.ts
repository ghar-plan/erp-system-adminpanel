import { CustomerTypes_APIS } from "@/libs/apis/customer-types.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useCustomerTypes = () => {
  const getCustomerTypes = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await CustomerTypes_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllCustomerTypes = async (setData: Function) => {
    const response = await CustomerTypes_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCustomerTypeById = async (id: string, setData: Function) => {
    const response = await CustomerTypes_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createCustomerType = async (body: any) => {
    const response = await CustomerTypes_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      return response;
    }
  };

  const updateCustomerType = async (id: string, body: any) => {
    const response = await CustomerTypes_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      return response;
    }
  };

  const deleteCustomerType = async (
    id: string,
    name: string,
    callback?: () => void,
  ) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this customer type? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await CustomerTypes_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
    }
  };

  const getPrices = async (
    id: string,
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await CustomerTypes_APIS.getPrices(id, params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  /** Fetches every saved price for a customer type (API max limit is 100 per page). */
  const getAllPrices = async (id: string, setData: Function) => {
    const pageSize = 100;
    let offset = 0;
    let total = 0;
    const all: any[] = [];

    do {
      const response = await CustomerTypes_APIS.getPrices(id, {
        limit: pageSize,
        offset,
      });
      const { status = false, data = [] } = response || {};
      if (!status || !Array.isArray(data)) {
        setData([]);
        return;
      }
      all.push(...data);
      total = response?.total ?? all.length;
      offset += pageSize;
    } while (all.length < total);

    setData(all);
  };

  const upsertPrices = async (id: string, body: any) => {
    const response = await CustomerTypes_APIS.upsertPrices(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Prices saved successfully");
      return response;
    }
  };

  const getProducts = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Gharplans_APIS.getProducts(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getPickupPoints = async (setData: Function) => {
    const response = await Gharplans_APIS.getPickupPoints();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  return {
    getCustomerTypes,
    getAllCustomerTypes,
    getCustomerTypeById,
    createCustomerType,
    updateCustomerType,
    deleteCustomerType,
    getPrices,
    getAllPrices,
    upsertPrices,
    getProducts,
    getPickupPoints,
  };
};

export default useCustomerTypes;
