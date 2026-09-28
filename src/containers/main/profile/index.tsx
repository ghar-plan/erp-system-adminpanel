import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Mail,
  Building2,
  Globe,
  Save,
  Loader2,
  KeyRound,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import { Users_APIS } from "@/libs/apis/users.api";
import { Auth_APIS } from "@/libs/apis/auth.api";
import {
  successToaster,
  errorToaster,
} from "@/utils/helpers/common/alert-service";

interface ProfileFormInputs {
  fullName: string;
  title: string;
  companyName: string;
  country: string;
  gender: string;
}

interface PasswordFormInputs {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

type TabType = "personal" | "security" | "account";

export default function MyProfile() {
  const { getUser, userData } = useStore();
  const currentUser = getUser();

  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      fullName: currentUser?.fullName || currentUser?.name || "",
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
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
    watch,
  } = useForm<PasswordFormInputs>({
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Sync profile form values if currentUser arrives/updates
  useEffect(() => {
    if (currentUser) {
      resetProfileForm({
        fullName: currentUser?.fullName || currentUser?.name || "",
        title: currentUser?.title || "",
        companyName: currentUser?.companyName || "",
        country: currentUser?.country || "",
        gender: currentUser?.gender || "",
      });
    }
  }, [currentUser, resetProfileForm]);

  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");

  const isPasswordMatch =
    watchedPassword &&
    watchedConfirmPassword &&
    watchedPassword === watchedConfirmPassword;

  const onSubmitProfile = async (data: ProfileFormInputs) => {
    setProfileLoading(true);
    try {
      const payload = {
        fullName: data.fullName.trim(),
        title: data.title.trim(),
        companyName: data.companyName.trim(),
        country: data.country.trim(),
        gender: data.gender,
      };
      const response = await Users_APIS.updateProfile(payload);
      if (response) {
        userData({
          ...currentUser,
          ...payload,
        });
        resetProfileForm(data);
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
        currentPassword: data.currentPassword,
        password: data.password,
      });
      if (response?.status) {
        successToaster("Password updated successfully.");
        resetPasswordForm({
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      errorToaster(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = currentUser?.fullName || currentUser?.name || "Active User";
  const userRole =
    currentUser?.currentRole ||
    (typeof currentUser?.role === "string"
      ? currentUser.role
      : currentUser?.role?.name) ||
    "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("") || "US";

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Profile Card */}
      <div className="rounded-xl border border-border-main bg-card shadow-xs">
        {/* Profile Info Header */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-sm shrink-0">
                {initials}
              </div>

              {/* Title & Meta */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                    {userRole}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  {currentUser?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={15} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{currentUser.email}</span>
                    </span>
                  )}
                  {currentUser?.title && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={15} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{currentUser.title}</span>
                    </span>
                  )}
                  {currentUser?.companyName && (
                    <span className="flex items-center gap-1.5">
                      <Building2 size={15} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{currentUser.companyName}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-bg text-success-text border border-success-text/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* Integrated Navigation Tabs */}
        <div className="px-5 sm:px-6 border-t border-border-main bg-panel-bg/30">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === "personal"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === "security"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock size={16} />
              <span>Security & Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === "account"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck size={16} />
              <span>Account & Roles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === "personal" && (
        <div className="bg-card border border-border-main rounded-xl shadow-xs animate-slide-up">
          <div className="p-5 sm:p-6 border-b border-border-main flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User size={18} className="text-primary" />
                Personal Information
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Update your identity, company details, and display preferences.
              </p>
            </div>
            {isProfileDirty && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Unsaved changes
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="p-5 sm:p-6 space-y-6">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Full Name */}
              <div>
                <label className="mb-2 block ui-form-label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    className={`common-input pl-9.5 ${
                      profileErrors.fullName ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder="e.g. John Doe"
                    {...registerProfile("fullName", {
                      required: "Full name is required",
                      validate: (v) => v.trim().length > 0 || "Full name is required",
                    })}
                  />
                </div>
                {profileErrors.fullName && (
                  <p className="mt-1.5 text-xs text-danger-text font-semibold">
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email Address (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block ui-form-label">Email Address</label>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-panel-bg px-2 py-0.5 rounded border border-panel-border">
                    Managed by Admin
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={currentUser?.email || ""}
                    className="common-input pl-9.5 cursor-not-allowed opacity-75 bg-panel-bg"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* Designation / Title */}
              <div>
                <label className="mb-2 block ui-form-label">Designation / Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    className="common-input pl-9.5"
                    placeholder="e.g. Managing Director"
                    {...registerProfile("title")}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="mb-2 block ui-form-label">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    className="common-input pl-9.5"
                    placeholder="e.g. Ghar Plans Builders"
                    {...registerProfile("companyName")}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="mb-2 block ui-form-label">Country / Region</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Globe size={16} />
                  </div>
                  <input
                    type="text"
                    className="common-input pl-9.5"
                    placeholder="e.g. Pakistan"
                    {...registerProfile("country")}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="mb-2 block ui-form-label">Gender</label>
                <select className="common-input bg-card" {...registerProfile("gender")}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-border-main/60">
              <button
                type="button"
                disabled={!isProfileDirty || profileLoading}
                onClick={() =>
                  resetProfileForm({
                    fullName: currentUser?.fullName || currentUser?.name || "",
                    title: currentUser?.title || "",
                    companyName: currentUser?.companyName || "",
                    country: currentUser?.country || "",
                    gender: currentUser?.gender || "",
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={profileLoading}
                className="flex h-10 px-6 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <div className="bg-card border border-border-main rounded-xl shadow-xs animate-slide-up space-y-6">
          <div className="p-5 sm:p-6 border-b border-border-main">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Security Settings
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Ensure your account is using a strong and unique password.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="p-5 sm:p-6 space-y-6">
            {/* Info Notice */}
            <div className="p-4 rounded-xl bg-info-bg border border-info-text/20 flex items-start gap-3 text-info-text">
              <Sparkles size={18} className="shrink-0 mt-0.5 text-primary" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-foreground">Password Guidelines</p>
                <p className="text-muted-foreground">
                  Use at least 6 characters. Combining letters, numbers, and symbols is strongly recommended.
                </p>
              </div>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              {/* Current Password */}
              <div className="sm:col-span-2">
                <label className="mb-2 block ui-form-label">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className={`common-input pl-9.5 pr-10 ${
                      passwordErrors.currentPassword
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    {...registerPassword("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1.5 text-xs text-danger-text font-semibold">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 block ui-form-label">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className={`common-input pl-9.5 pr-10 ${
                      passwordErrors.password ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    {...registerPassword("password", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      validate: (value, formValues) =>
                        value !== formValues.currentPassword ||
                        "New password must be different from current password",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="mt-1.5 text-xs text-danger-text font-semibold">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block ui-form-label">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`common-input pl-9.5 pr-10 ${
                      passwordErrors.confirmPassword ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    {...registerPassword("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-danger-text font-semibold">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
                {isPasswordMatch && !passwordErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-success-text font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-border-main/60">
              <button
                type="button"
                disabled={!isPasswordDirty || passwordLoading}
                onClick={() =>
                  resetPasswordForm({
                    currentPassword: "",
                    password: "",
                    confirmPassword: "",
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw size={15} />
                <span>Clear</span>
              </button>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex h-10 px-6 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Account & Roles */}
      {activeTab === "account" && (
        <div className="bg-card border border-border-main rounded-xl shadow-xs animate-slide-up p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              Account & Role Overview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Overview of your assigned role, account status, and system access scope.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Role */}
            <div className="p-4 rounded-xl border border-border-main bg-panel-bg space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Assigned Role
              </span>
              <div className="flex items-center gap-2.5">
                <Shield size={18} className="text-primary" />
                <span className="text-base font-bold text-foreground uppercase tracking-wide">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Account Status */}
            <div className="p-4 rounded-xl border border-border-main bg-panel-bg space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Account Status
              </span>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base font-semibold text-foreground">
                  Active & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Permissions Overview */}
          {Array.isArray(currentUser?.permissions) && currentUser.permissions.length > 0 && (
            <div className="pt-4 border-t border-border-main/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Active Granted Permissions ({currentUser.permissions.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                {currentUser.permissions.map((perm: string, index: number) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-card border border-border-main text-foreground/80 shadow-2xs"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
