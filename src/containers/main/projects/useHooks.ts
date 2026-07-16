import { Projects_APIS } from "@/libs/apis/projects.api";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { useNavigate } from "react-router-dom";
import { Project } from "@/utils/helpers/models/projects/project.dto";

const useProjects = () => {
  const navigate = useNavigate();

  const createProject = async (data: {
    siteName: string;
    region: string;
    subregion: string;
    startDate: string;
    mediaId: string | null;
  }) => {
    // Sanitize payload: remove null/empty mediaId to avoid UUID validation check error on NestJS backend
    const payload = {
      siteName: data.siteName,
      region: data.region,
      subregion: data.subregion,
      startDate: data.startDate,
      ...(data.mediaId ? { mediaId: data.mediaId } : {}),
    };

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

  const updateProject = async (id: string, queryParams: any = {}) => {
    const response = await Projects_APIS.update(id, queryParams);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/projects");
      return response;
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
    deleteProject,
    uploadImage,
    getProjectById,
    updateProject,
    getFinancialStatus,
  };
};

export default useProjects;
