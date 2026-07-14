import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import Button from "@/components/ui/Button";
import useAuth from "../useHooks";

interface ResendOtpForm {
  email: string;
}

const ResendOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useStore();
  const { resendOtp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendOtpForm>({
    defaultValues: {
      email: location.state?.email || "",
    },
  });

  const onSubmit = async (data: ResendOtpForm) => {
    const success = await resendOtp({ email: data.email });
    if (success) {
      navigate("/auth/verify-otp", { state: { email: data.email } });
    }
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
              d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Forgot Password</h2>
        <p className="text-muted-foreground mt-2">
          Enter your email address to receive a verification code
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            placeholder="john.doe@example.com"
            className="common-input"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" isLoading={isLoading} fullWidth size="lg">
          Send Code
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

export default ResendOtp;
