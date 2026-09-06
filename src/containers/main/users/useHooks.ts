import { useNavigate } from "react-router-dom";
import { Users_APIS } from "@/libs/apis/users.api";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const useUsers = () => {
  const navigate = useNavigate();

  const createUser = async (body: {
    fullName: string;
    title?: string;
    email: string;
    roleIds: string[];
  }) => {
    const response = await Users_APIS.createUser(body);
    if (response?.status === true) {
      successToaster(
        response.message ||
          "User created successfully. Login details sent to email.",
      );
      navigate(siteRoutes.users, { replace: true });
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to create user");
    }
    return false;
  };

  const setUserStatus = async (
    id: string,
    status: boolean,
    onSuccess?: () => void,
  ) => {
    const response = await Users_APIS.setStatus(id, status);
    if (response?.status === true) {
      successToaster(
        response.message ||
          (status ? "User enabled successfully" : "User disabled successfully"),
      );
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to update user status");
    }
    return false;
  };

  const deleteUser = async (
    id: string,
    name: string,
    onSuccess?: () => void,
  ) => {
    const confirm = await confirmationPopup(
      `Delete ${name}?`,
      "This user will be removed and will no longer be able to sign in.",
    );
    if (!confirm.isConfirmed) return false;
    const response = await Users_APIS.deleteUser(id);
    if (response?.status === true) {
      successToaster(response.message || "User deleted successfully");
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to delete user");
    }
    return false;
  };

  return { createUser, setUserStatus, deleteUser };
};

export default useUsers;
