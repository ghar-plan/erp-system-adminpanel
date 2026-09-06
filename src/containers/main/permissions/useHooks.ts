import { Permissions_APIS } from "@/libs/apis/permissions.api";
import {
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";
import { mapCatalogPermission } from "../roles/group-permissions";
import type { RbacPermission } from "../roles/types";

const usePermissionsAdmin = () => {
  const getPermissions = async (
    setList: (rows: RbacPermission[]) => void,
    queryParams: Record<string, unknown>,
    setTotal: (total: number) => void,
  ) => {
    const response = await Permissions_APIS.getAll(queryParams);
    if (response?.status) {
      setList((response.data || []).map(mapCatalogPermission));
      setTotal(response.total ?? 0);
      return;
    }
    setList([]);
    setTotal(0);
  };

  const setPermissionStatus = async (
    id: string,
    status: boolean,
    onSuccess?: () => void,
  ) => {
    const response = await Permissions_APIS.setStatus(id, status);
    if (response?.status === true) {
      successToaster(
        response.message ||
          (status
            ? "Permission enabled successfully"
            : "Permission disabled successfully"),
      );
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to update permission");
    }
    return false;
  };

  return { getPermissions, setPermissionStatus };
};

export default usePermissionsAdmin;
