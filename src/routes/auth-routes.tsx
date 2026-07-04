import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../components/layouts/auth-layout";
import Login from "../containers/auth/login";
import VerifyOtp from "../containers/auth/verify-otp";
import ResendOtp from "../containers/auth/resend-otp";
import ResetPassword from "../containers/auth/reset-password";

const AuthRoutes = () => {
  return (
    <AuthLayout>
      <Routes>
        <Route path="/login" Component={Login} />

        <Route path="/verify-otp" Component={VerifyOtp} />
        <Route path="/resend-otp" Component={ResendOtp} />
        <Route path="/reset-password" Component={ResetPassword} />
      </Routes>
    </AuthLayout>
  );
};

export default AuthRoutes;
