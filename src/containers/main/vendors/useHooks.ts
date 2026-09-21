import { Vendors_APIS } from "@/libs/apis/vendors.api";
import { Materials_APIS } from "@/libs/apis/materials.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useVendors = () => {
  const navigate = useNavigate();

  const createVendor = async (body: any) => {
    const response = await Vendors_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/vendors");
      return response;
    }
  };

  const getVendors = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Vendors_APIS.getAll(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllVendors = async (setData: Function) => {
    const response = await Vendors_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendorById = async (id: string, setData: Function) => {
    const response = await Vendors_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const updateVendor = async (id: string, body: any) => {
    const response = await Vendors_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/vendors");
      return response;
    }
  };

  const deleteVendor = async (
    id: string,
    name: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this vendor? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await Vendors_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      } else {
        successToaster(message);
      }
    }
  };

  const getVendorsPaymentSummary = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Vendors_APIS.getPaymentSummary(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getVendorFilterOptions = async (setData: Function) => {
    const response = await Vendors_APIS.getFilterOptions();
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData({
        cities: data.cities || [],
      });
    } else {
      setData({ cities: [] });
    }
  };

  const getMaterials = async (setData: Function) => {
    const response = await Materials_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createMaterial = async (name: string) => {
    const response = await Materials_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Material created successfully");
      return data;
    }
    return null;
  };

  const updateMaterial = async (id: string, name: string) => {
    const response = await Materials_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Material updated successfully");
      return data;
    }
    return null;
  };

  const deleteMaterial = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this material?",
    );
    if (!result.isConfirmed) return false;
    const response = await Materials_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Material deleted successfully");
      return true;
    }
    return false;
  };

  return {
    createVendor,
    getVendors,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getVendorsPaymentSummary,
    getVendorFilterOptions,
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
};

export default useVendors;
