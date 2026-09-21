import { Projects_APIS } from "@/libs/apis/projects.api";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { useNavigate } from "react-router-dom";
import { PaymentPlan, ProjectStatus } from "@/utils/helpers/models/projects/project.dto";

const useProjects = () => {
  const navigate = useNavigate();

  const buildProjectPayload = (data: {
    siteName: string;
    region: string;
    subregion: string;
    startDate: string;
    constructionType: string;
    paymentPlan: string;
    markupPercentage?: number | string | null;
    amount?: number | string | null;
    mediaId?: string | null;
    clientFullName?: string;
    clientEmail?: string;
    clientPhone?: string;
    guardName?: string | null;
    guardContactNumber?: string | null;
    supervisorName?: string;
    supervisorContactNumber?: string;
    managerName?: string;
    managerContactNumber?: string;
    paymentStages?: Array<{
      stage: string;
      amount: number | string;
      expectedDate: string;
    }> | null;
  }) => ({
    siteName: data.siteName,
    region: data.region,
    subregion: data.subregion,
    startDate: data.startDate,
    constructionType: data.constructionType,
    paymentPlan: data.paymentPlan,
    ...(data.paymentPlan === PaymentPlan.MARKUP &&
    data.markupPercentage !== null &&
    data.markupPercentage !== undefined &&
    data.markupPercentage !== ""
      ? { markupPercentage: Number(data.markupPercentage) }
      : {}),
    ...((data.paymentPlan === PaymentPlan.LUMP_SUM &&
    data.amount !== null &&
    data.amount !== undefined &&
    data.amount !== "")
      ? { amount: Number(data.amount) }
      : {}),
    ...(data.paymentPlan === PaymentPlan.LUMP_SUM
      ? {
          paymentStages: Array.isArray(data.paymentStages)
            ? data.paymentStages.map((stage) => ({
                stage: String(stage.stage || "").trim(),
                amount: Number(stage.amount),
                expectedDate: stage.expectedDate,
              }))
            : [],
        }
      : Object.prototype.hasOwnProperty.call(data, "paymentStages")
        ? { paymentStages: [] }
        : {}),
    ...(data.mediaId ? { mediaId: data.mediaId } : {}),
    ...(data.clientFullName ? { clientFullName: data.clientFullName.trim() } : {}),
    ...(data.clientEmail ? { clientEmail: data.clientEmail.trim() } : {}),
    ...(data.clientPhone ? { clientPhone: data.clientPhone.trim() } : {}),
    ...(data.guardName !== undefined
      ? { guardName: data.guardName?.trim() || null }
      : {}),
    ...(data.guardContactNumber !== undefined
      ? { guardContactNumber: data.guardContactNumber?.trim() || null }
      : {}),
    ...(data.supervisorName ? { supervisorName: data.supervisorName.trim() } : {}),
    ...(data.supervisorContactNumber
      ? { supervisorContactNumber: data.supervisorContactNumber.trim() }
      : {}),
    ...(data.managerName ? { managerName: data.managerName.trim() } : {}),
    ...(data.managerContactNumber ? { managerContactNumber: data.managerContactNumber.trim() } : {}),
  });

  const createProject = async (data: {
    siteName: string;
    region: string;
    subregion: string;
    startDate: string;
    constructionType: string;
    paymentPlan: string;
    markupPercentage?: number | string | null;
    amount?: number | string | null;
    mediaId: string | null;
    clientFullName: string;
    clientEmail: string;
    clientPhone: string;
  }) => {
    // Sanitize payload: remove null/empty mediaId to avoid UUID validation check error on NestJS backend
    const payload = buildProjectPayload(data);

    const response = await Projects_APIS.create(payload);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/projects");
      return response;
    }
  };

  const getProjects = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Projects_APIS.getAll(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllProjects = async (setData: Function) => {
    const response = await Projects_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getProjectFilterOptions = async (setData: Function) => {
    const response = await Projects_APIS.getFilterOptions();
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData({
        cities: data.cities || [],
        areas: data.areas || [],
        managers: data.managers || [],
      });
    } else {
      setData({ cities: [], areas: [], managers: [] });
    }
  };

  const getManagerOptions = async (setData: Function) => {
    const response = await Projects_APIS.getManagerOptions();
    const { status = false, data = [] } = response || {};
    if (status && Array.isArray(data)) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const deleteProject = async (
    id: string,
    name: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this site entry? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await Projects_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
        return response;
      } else {
        errorToaster(message || "Failed to delete site");
      }
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await Projects_APIS.uploadImage(formData);
    const data = response?.data || response || [];
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // Returns { id, url }
    }
    return null;
  };

  const getProjectById = async (id: string, setData: Function) => {
    const response = await Projects_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const getPullableMaterials = async (id: string, setData: Function) => {
    const response = await Projects_APIS.getPullableMaterials(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data.vendors || []);
      return data;
    }
    setData([]);
    return null;
  };

  const pullMaterials = async (
    id: string,
    items: Array<{
      vendorId: string;
      materialId: string;
      quantity?: number;
      uom?: string;
      notes?: string;
    }>,
  ) => {
    const response = await Projects_APIS.pullMaterials(id, { items });
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Materials pulled successfully");
      return response;
    }
    return null;
  };

  const updateProject = async (id: string, queryParams: any = {}) => {
    const payload = buildProjectPayload(queryParams);
    const response = await Projects_APIS.update(id, payload);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/projects");
      return response;
    }
  };

  const updateProjectStatus = async (
    id: string,
    name: string,
    status: ProjectStatus,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `${status} ${name}`,
      `Are you sure you want to mark this project as ${status.toLowerCase()}? It will no longer appear on the projects home page.`,
    );
    if (result.isConfirmed) {
      const response = await Projects_APIS.update(id, { status });
      const { status: ok = false, message = "" } = response || {};
      if (ok) {
        successToaster(message || `Project marked as ${status.toLowerCase()}`);
        callback?.();
        return response;
      } else {
        errorToaster(message || "Failed to update project status");
      }
    }
  };

  const getFinancialStatus = async (id: string, setData: Function) => {
    const response = await Projects_APIS.getFinancialStatus(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  return {
    createProject,
    getProjects,
    getAllProjects,
    deleteProject,
    uploadImage,
    getProjectById,
    getPullableMaterials,
    pullMaterials,
    updateProject,
    updateProjectStatus,
    getProjectFilterOptions,
    getManagerOptions,
    getFinancialStatus,
  };
};

export default useProjects;
