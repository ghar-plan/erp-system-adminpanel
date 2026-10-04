import { DesignVendors_APIS } from "@/libs/apis/design/design-vendors.api";
import { DesignServices_APIS } from "@/libs/apis/design/design-services.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const useDesignVendors = () => {
  const navigate = useNavigate();

  const createVendor = async (body: any) => {
    const response = await DesignVendors_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate(siteRoutes.designVendors);
      return response;
    }
  };

  const getVendors = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await DesignVendors_APIS.getAll(queryParams);
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
    const response = await DesignVendors_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendorById = async (id: string, setData: Function) => {
    const response = await DesignVendors_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const updateVendor = async (id: string, body: any) => {
    const response = await DesignVendors_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate(siteRoutes.designVendors);
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
      const response = await DesignVendors_APIS.delete(id);
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
    const response = await DesignVendors_APIS.getPaymentSummary(queryParams);
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
    const response = await DesignVendors_APIS.getFilterOptions();
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData({
        cities: data.cities || [],
      });
    } else {
      setData({ cities: [] });
    }
  };

  const getServices = async (setData: Function) => {
    const response = await DesignServices_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createService = async (name: string) => {
    const response = await DesignServices_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Service created successfully");
      return data;
    }
    return null;
  };

  const updateService = async (id: string, name: string) => {
    const response = await DesignServices_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Service updated successfully");
      return data;
    }
    return null;
  };

  const deleteService = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this service?",
    );
    if (!result.isConfirmed) return false;
    const response = await DesignServices_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Service deleted successfully");
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
    getServices,
    createService,
    updateService,
    deleteService,
  };
};

export default useDesignVendors;
