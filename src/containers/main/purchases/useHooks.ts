import { Purchases_APIS } from "@/libs/apis/purchases.api";
import { PurchaseSuppliers_APIS } from "@/libs/apis/purchase-suppliers.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const usePurchases = () => {
  const navigate = useNavigate();

  const getPurchases = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Purchases_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getPurchaseById = async (id: string, setData: Function) => {
    const response = await Purchases_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createPurchase = async (body: any) => {
    const response = await Purchases_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate(siteRoutes.purchasesList);
      return response;
    }
  };

  const updatePurchase = async (id: string, body: any) => {
    const response = await Purchases_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate(siteRoutes.purchasesList);
      return response;
    }
  };

  const deletePurchase = async (
    id: string,
    name: string,
    callback?: () => void,
  ) => {
    const result = await confirmationPopup(
      `Delete purchase`,
      `Are you sure you want to delete this purchase from "${name}"? This action cannot be undone.`,
    );
    if (result.isConfirmed) {
      const response = await Purchases_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
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

  const getPurchaseSuppliers = async (setData: Function) => {
    const response = await PurchaseSuppliers_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createPurchaseSupplier = async (name: string) => {
    const response = await PurchaseSuppliers_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Supplier created successfully");
      return data;
    }
    return null;
  };

  const updatePurchaseSupplier = async (id: string, name: string) => {
    const response = await PurchaseSuppliers_APIS.update(id, {
      name: name.trim(),
    });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Supplier updated successfully");
      return data;
    }
    return null;
  };

  const deletePurchaseSupplier = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this supplier?",
    );
    if (!result.isConfirmed) return false;
    const response = await PurchaseSuppliers_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Supplier deleted successfully");
      return true;
    }
    return false;
  };

  return {
    getPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    getProducts,
    getPurchaseSuppliers,
    createPurchaseSupplier,
    updatePurchaseSupplier,
    deletePurchaseSupplier,
  };
};

export default usePurchases;
