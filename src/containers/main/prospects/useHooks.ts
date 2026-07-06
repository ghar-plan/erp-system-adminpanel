import { Prospects_APIS } from "@/libs/apis/prospects.api";
import { useNavigate } from "react-router-dom";
import { successToaster } from "@/utils/helpers/common/alert-service";

const useProspects = () => {
  const navigate = useNavigate();

  const getProspects = async (
    setData: Function,
    setTotalElements?: Function,
  ) => {
    const response = await Prospects_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getProspectById = async (id: string, setData: Function) => {
    const response = await Prospects_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createProspect = async (body: any) => {
    const response = await Prospects_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/prospects");
      return response;
    }
  };

  const updateProspect = async (id: string, body: any) => {
    const response = await Prospects_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/prospects");
      return response;
    }
  };

  const updateProspectStatus = async (
    id: string,
    status: string,
    callback?: () => void,
  ) => {
    const response = await Prospects_APIS.updateStatus(id, status);
    const { status: callStatus = false, message = "" } = response || {};
    if (callStatus) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const deleteProspect = async (id: string, callback?: () => void) => {
    const response = await Prospects_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  return {
    getProspects,
    getProspectById,
    createProspect,
    updateProspect,
    updateProspectStatus,
    deleteProspect,
  };
};

export default useProspects;
