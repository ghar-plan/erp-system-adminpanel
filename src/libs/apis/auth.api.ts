import { postRequest } from "../../utils/helpers/common/http-methods";
import { LoginDTO } from "@/utils/helpers/models/auth/login.dto";
import { VerifyOtpDTO } from "@/utils/helpers/models/auth/verify-otp.dto";
import { ResendOtpDTO } from "@/utils/helpers/models/auth/resend-otp.dto";
import { ResetPasswordDTO } from "@/utils/helpers/models/auth/reset-password.dto";
import { UpdatePasswordDTO } from "@/utils/helpers/models/auth/update-password.dto";

export const Auth_APIS = {
  login: (body: LoginDTO) => postRequest("/v1/auth/login", body),
  verifyOtp: (body: VerifyOtpDTO) => postRequest("/v1/auth/verify-otp", body),
  resendOtp: (body: ResendOtpDTO) => postRequest("/v1/auth/resend-otp", body),
  resetPassword: (body: ResetPasswordDTO) => postRequest("/v1/auth/reset-password", body),
  updatePassword: (body: UpdatePasswordDTO) => postRequest("/v1/auth/update-password", body),
};
