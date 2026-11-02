import { Sales_APIS } from "@/libs/apis/sales.api";
import { CustomerTypes_APIS } from "@/libs/apis/customer-types.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import { PurchaseSuppliers_APIS } from "@/libs/apis/purchase-suppliers.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

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
      navigate(siteRoutes.salesList);
      return response;
    }
  };

  const updateSale = async (id: string, body: any) => {
    const response = await Sales_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate(siteRoutes.salesList);
      return response;
    }
  };

  const postSale = async (id: string, body: any = {}) => {
    const response = await Sales_APIS.post(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Sale posted successfully");
      navigate(siteRoutes.salesList);
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

  const getCustomerTypes = async (
    setData: Function,
    params: { activeOnly?: boolean } = {},
  ) => {
    const response = await CustomerTypes_APIS.getAllWithoutPagination(params);
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
    variantId: string = "",
  ) => {
    const response = await CustomerTypes_APIS.getProductRate(
      customerTypeId,
      productId,
      variantId,
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

  const getBrands = async (setData: Function) => {
    const response = await Gharplans_APIS.getBrands();
    const { status = false, data = [] } = response || {};
    setData(status && data ? data : []);
  };

  const getVendors = async (setData: Function) => {
    const response = await PurchaseSuppliers_APIS.getAll();
    const { status = false, data = [] } = response || {};
    setData(status && data ? data : []);
  };

  return {
    getSales,
    getSaleById,
    createSale,
    updateSale,
    postSale,
    deleteSale,
    getCustomerTypes,
    getProductRate,
    getProducts,
    getBrands,
    getVendors,
  };
};

export default useSales;
