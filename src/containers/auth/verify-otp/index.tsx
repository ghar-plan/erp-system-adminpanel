import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "@/hooks/useStore";
import Button from "@/components/ui/Button";
import useAuth from "../useHooks";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useStore();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || "user@example.com";

  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) return;

    const result = await verifyOtp({
      email,
      otp: Number(fullOtp),
      verificationType: "password-reset",
    });
    if (result && result.tempToken) {
      navigate("/auth/reset-password", {
        state: { email, tempToken: result.tempToken },
      });
    }
  };

  const handleResend = async () => {
    await resendOtp({ email });
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Verify OTP</h2>
        <p className="text-muted-foreground mt-2">
          We sent a verification code to <br />
          <span className="font-semibold text-muted-foreground">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center gap-4 my-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={data}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center text-xl font-bold bg-bg-input text-foreground border border-border-main rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
          ))}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="lg"
          disabled={otp.join("").length < 4}
        >
          Verify Code
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Resend Code
          </button>
        </p>
      </div>
    </>
  );
};

export default VerifyOtp;
