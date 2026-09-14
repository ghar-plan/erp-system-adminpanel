import { Employees_APIS } from "@/libs/apis/employees.api";
import { useNavigate } from "react-router-dom";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const useEmployees = () => {
  const navigate = useNavigate();

  const createEmployee = async (body: any) => {
    const response = await Employees_APIS.create(body);
    if (response?.status) {
      successToaster(response.message || "Employee registered successfully");
      navigate(siteRoutes.employees);
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to register employee");
    }
    return false;
  };

  const getEmployees = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Employees_APIS.getAll(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllEmployees = async (setData: Function) => {
    const response = await Employees_APIS.getAllWithoutPagination();
    if (response?.status && response.data) {
      setData(response.data);
    } else {
      setData([]);
    }
  };

  const getMyEmployee = async (setData: Function) => {
    const response = await Employees_APIS.getMe();
    if (response?.status) {
      setData(response.data || null);
    } else {
      setData(null);
    }
  };

  const getEmployeeById = async (id: string, setData: Function) => {
    const response = await Employees_APIS.getById(id);
    if (response?.status && response.data) {
      setData(response.data);
    }
  };

  const getEmployeeAttendance = async (
    id: string,
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Employees_APIS.getAttendance(id, queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
      return;
    }
    setData([]);
    setTotalElements?.(0);
  };

  const getEmployeeLeaves = async (
    id: string,
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Employees_APIS.getLeaves(id, queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
      return;
    }
    setData([]);
    setTotalElements?.(0);
  };

  const updateEmployee = async (id: string, body: any) => {
    const response = await Employees_APIS.update(id, body);
    if (response?.status) {
      successToaster(response.message || "Employee updated successfully");
      navigate(siteRoutes.employees);
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to update employee");
    }
    return false;
  };

  const deleteEmployee = async (id: string, name: string, callback?: Function) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "This employee profile will be removed. Their user account will remain.",
    );
    if (!result.isConfirmed) return false;
    const response = await Employees_APIS.delete(id);
    if (response?.status) {
      successToaster(response.message || "Employee deleted successfully");
      callback?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to delete employee");
    }
    return false;
  };

  return {
    createEmployee,
    getEmployees,
    getAllEmployees,
    getMyEmployee,
    getEmployeeById,
    getEmployeeAttendance,
    getEmployeeLeaves,
    updateEmployee,
    deleteEmployee,
  };
};

export default useEmployees;
