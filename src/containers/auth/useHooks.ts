import { Auth_APIS } from "@/libs/apis/auth.api";
import {
  successToaster,
} from "@/utils/helpers/common/alert-service";
import { useNavigate } from "react-router-dom";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import useStore from "@/hooks/useStore";
import { LoginDTO } from "@/utils/helpers/models/auth/login.dto";
import { VerifyOtpDTO } from "@/utils/helpers/models/auth/verify-otp.dto";
import { ResendOtpDTO } from "@/utils/helpers/models/auth/resend-otp.dto";
import { ResetPasswordDTO } from "@/utils/helpers/models/auth/reset-password.dto";
import { UpdatePasswordDTO } from "@/utils/helpers/models/auth/update-password.dto";
import { normalizeAuthSession } from "@/utils/helpers/common/auth-mapper";
import { useAppDispatch } from "@/store/hooks";
import { setSessionStatus } from "@/store/slices/sharedSlice";
import { firstAllowedPath } from "@/navigation/menu.config";
import {
  buildPermissionContext,
  checkAnyPermission,
  checkPermission,
} from "@/utils/helpers/permissions/permission-engine";

const useAuth = () => {
  const { setToken, userData } = useStore();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const login = async (body: LoginDTO) => {
    const response = await Auth_APIS.login(body);
    const { status = false, message = "" } = response || {};

    if (status) {
      const token = response?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        const session = normalizeAuthSession(response.data);
        setToken(token);
        userData(session);
        dispatch(setSessionStatus("ready"));
        const ctx = buildPermissionContext(session);
        const home = firstAllowedPath(
          (permission) => checkPermission(ctx, permission),
          (permissions) => checkAnyPermission(ctx, permissions),
        );
        successToaster(message || "Logged in successfully!");
        navigate(home, { replace: true });
      }
    }
  };

  const verifyOtp = async (body: VerifyOtpDTO) => {
    const response = await Auth_APIS.verifyOtp(body);
    const { status = false, message = "", data = null } = response || {};
    if (status) {
      successToaster(message || "OTP verified successfully!");
      return data;
    }
    return null;
  };

  const resendOtp = async (body: ResendOtpDTO) => {
    const response = await Auth_APIS.resendOtp(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "OTP sent successfully!");
      return true;
    }
    return false;
  };

  const resetPassword = async (body: ResetPasswordDTO) => {
    const response = await Auth_APIS.resetPassword(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Password reset successfully!");
      navigate(siteRoutes.login, { replace: true });
      return true;
    }
    return false;
  };

  const updatePassword = async (body: UpdatePasswordDTO) => {
    const response = await Auth_APIS.updatePassword(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Password updated successfully!");
      return true;
    }
    return false;
  };

  return {
    login,
    verifyOtp,
    resendOtp,
    resetPassword,
    updatePassword,
  };
};

export default useAuth;
