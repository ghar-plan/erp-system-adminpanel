import { Sales_APIS } from "@/libs/apis/sales.api";
import { CustomerTypes_APIS } from "@/libs/apis/customer-types.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useSales = () => {
  const navigate = useNavigate();

  const getSales = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Sales_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getSaleById = async (id: string, setData: Function) => {
    const response = await Sales_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createSale = async (body: any) => {
    const response = await Sales_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/sales");
      return response;
    }
  };

  const updateSale = async (id: string, body: any) => {
    const response = await Sales_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/sales");
      return response;
    }
  };

  const deleteSale = async (
    id: string,
    name: string,
    callback?: () => void,
  ) => {
    const result = await confirmationPopup(
      `Delete sale`,
      `Are you sure you want to delete this sale record${name ? ` for "${name}"` : ""}? This action cannot be undone.`,
    );
    if (result.isConfirmed) {
      const response = await Sales_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
    }
  };

  const getCustomerTypes = async (setData: Function) => {
    const response = await CustomerTypes_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getProductRate = async (
    customerTypeId: string,
    productId: string,
    setData: (rate: number | null) => void,
  ) => {
    const response = await CustomerTypes_APIS.getProductRate(
      customerTypeId,
      productId,
    );
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data.rate ?? null);
    } else {
      setData(null);
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

  return {
    getSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    getCustomerTypes,
    getProductRate,
    getProducts,
  };
};

export default useSales;
