import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import Button from "@/components/ui/Button";
import useAuth from "../useHooks";
import { ResetPasswordDTO } from "@/utils/helpers/models/auth/reset-password.dto";

interface ResetPasswordForm extends ResetPasswordDTO {
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useStore();
  const { resetPassword } = useAuth();

  const tempToken = location.state?.tempToken || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      tempToken,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: ResetPasswordForm) => {
    await resetPassword({
      password: data.password,
      tempToken,
    });
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m-9 9a2 2 0 01-2-2v-6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H8z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Reset Password</h2>
        <p className="text-muted-foreground mt-2">
          Create a new secure password for your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            New Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            })}
            placeholder="••••••••"
            className="common-input"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === passwordValue || "The passwords do not match",
            })}
            placeholder="••••••••"
            className="common-input"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" isLoading={isLoading} fullWidth size="lg">
          Reset Password
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate("/auth/login")}
          className="text-sm text-primary hover:underline font-semibold cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </>
  );
};

export default ResetPassword;
