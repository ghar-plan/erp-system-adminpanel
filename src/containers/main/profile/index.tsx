import React, { useState } from "react";
import { User, Lock, Mail, Building, Globe, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import { Users_APIS } from "@/libs/apis/users.api";
import { Auth_APIS } from "@/libs/apis/auth.api";
import { successToaster, errorToaster } from "@/utils/helpers/common/alert-service";

interface ProfileFormInputs {
  fullName: string;
  title: string;
  companyName: string;
  country: string;
  gender: string;
}

interface PasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export default function MyProfile() {
  const { getUser, userData } = useStore();
  const currentUser = getUser();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      fullName: currentUser?.fullName || "",
      title: currentUser?.title || "",
      companyName: currentUser?.companyName || "",
      country: currentUser?.country || "",
      gender: currentUser?.gender || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<PasswordFormInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = async (data: ProfileFormInputs) => {
    setProfileLoading(true);
    try {
      const response = await Users_APIS.updateProfile(data);
      if (response) {
        // Update local redux user session info
        userData({
          ...currentUser,
          ...data,
        });
        successToaster("Profile details updated successfully.");
      }
    } catch (err: any) {
      errorToaster(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormInputs) => {
    setPasswordLoading(true);
    try {
      const response = await Auth_APIS.updatePassword({
        password: data.password,
      });
      if (response?.status) {
        successToaster("Password updated successfully.");
        resetPasswordForm();
      }
    } catch (err: any) {
      errorToaster(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings, personal details, and security.
        </p>
      </div>

      <hr className="border-border-main" />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-slide-up">
        
        {/* Left Card: Account Overview */}
        <div className="lg:col-span-1 bg-card border border-border-main rounded-xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-primary/15 text-primary flex items-center justify-center font-extrabold text-3xl shadow-sm border border-primary/20">
            {currentUser?.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground truncate max-w-full">
              {currentUser?.fullName || "Active User"}
            </h2>
            <span className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase mt-1 inline-block">
              {currentUser?.currentRole ||
                (typeof currentUser?.role === "string"
                  ? currentUser.role
                  : currentUser?.role?.name) ||
                "User"}
            </span>
          </div>
          <div className="w-full border-t border-border-main pt-4 space-y-3 text-left">
            <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
              <Mail size={16} />
              <span className="truncate">{currentUser?.email}</span>
            </div>
            {currentUser?.title && (
              <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                <User size={16} />
                <span className="truncate">{currentUser.title}</span>
              </div>
            )}
            {currentUser?.companyName && (
              <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                <Building size={16} />
                <span className="truncate">{currentUser.companyName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Personal Details */}
          <div className="bg-card border border-border-main rounded-xl shadow-xs">
            <div className="p-6 border-b border-border-main">
              <h3 className="text-lg font-bold text-foreground">
                Personal Information
              </h3>
            </div>
            
            <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="p-6 space-y-6">
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block ui-form-label">Full Name</label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="e.g. John Doe"
                    {...registerProfile("fullName", { required: "Full name is required" })}
                  />
                  {profileErrors.fullName && (
                    <p className="mt-1 text-xs text-danger-text font-semibold">
                      {profileErrors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block ui-form-label">Designation / Title</label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="e.g. Managing Director"
                    {...registerProfile("title")}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="mb-2 block ui-form-label">Company Name</label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="e.g. Ghar Plans Builders"
                    {...registerProfile("companyName")}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block ui-form-label">Country</label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="e.g. Pakistan"
                    {...registerProfile("country")}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block ui-form-label">Gender</label>
                  <select className="common-input bg-card" {...registerProfile("gender")}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-border-main/60">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Save size={18} />
                      Save Personal Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password */}
          <div className="bg-card border border-border-main rounded-xl shadow-xs">
            <div className="p-6 border-b border-border-main">
              <h3 className="text-lg font-bold text-foreground">
                Security Settings
              </h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="p-6 space-y-6">
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {/* New Password */}
                <div>
                  <label className="mb-2 block ui-form-label">New Password</label>
                  <input
                    type="password"
                    className="common-input"
                    placeholder="Min 6 characters"
                    {...registerPassword("password", {
                      required: "New password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters long" },
                    })}
                  />
                  {passwordErrors.password && (
                    <p className="mt-1 text-xs text-danger-text font-semibold">
                      {passwordErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block ui-form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="common-input"
                    placeholder="Repeat new password"
                    {...registerPassword("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-danger-text font-semibold">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-border-main/60">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Lock size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
