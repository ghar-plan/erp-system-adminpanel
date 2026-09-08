import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import useEmployees from "../useHooks";

type EmployeeForm = {
  name: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  mobileNumber: string;
  designation: string;
};

const RADIUS_PRESETS = [10, 50, 100];

export default function EmployeesCreate() {
  const navigate = useNavigate();
  const { createEmployee } = useEmployees();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({
    defaultValues: {
      name: "",
      email: "",
      address: "",
      lat: undefined as unknown as number,
      lng: undefined as unknown as number,
      radius: 50,
      mobileNumber: "",
      designation: "",
    },
  });

  const radius = Number(watch("radius"));

  const onSubmit = async (form: EmployeeForm) => {
    await createEmployee({
      name: form.name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      radius: Number(form.radius),
      mobileNumber: form.mobileNumber.trim(),
      designation: form.designation.trim(),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.employees)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold">Register Employee</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All fields are required. The employee role is assigned automatically so they can check in, check out, and apply for leave.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full space-y-6 animate-slide-up" noValidate>
        <hr className="border-border-main" />
        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Name <span className="text-red-500">*</span></label>
              <input
                className={`common-input ${errors.name ? "border-red-500" : ""}`}
                placeholder="e.g., Ali Khan"
                {...register("name", { required: "Name is required", validate: (v) => v.trim().length > 0 || "Name is required" })}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                className={`common-input ${errors.email ? "border-red-500" : ""}`}
                placeholder="e.g., ali@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Mobile Number <span className="text-red-500">*</span></label>
              <input
                className={`common-input ${errors.mobileNumber ? "border-red-500" : ""}`}
                placeholder="e.g., 03001234567"
                {...register("mobileNumber", { required: "Mobile number is required", validate: (v) => v.trim().length > 0 || "Mobile number is required" })}
              />
              {errors.mobileNumber && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.mobileNumber.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Designation <span className="text-red-500">*</span></label>
              <input
                className={`common-input ${errors.designation ? "border-red-500" : ""}`}
                placeholder="e.g., Site Engineer"
                {...register("designation", { required: "Designation is required", validate: (v) => v.trim().length > 0 || "Designation is required" })}
              />
              {errors.designation && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.designation.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Address <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              className={`common-input ${errors.address ? "border-red-500" : ""}`}
              placeholder="Office / work location address"
              {...register("address", { required: "Address is required", validate: (v) => v.trim().length > 0 || "Address is required" })}
            />
            {errors.address && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.address.message}</p>}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Attendance location</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The employee can only check in or out within this radius of the configured coordinates.
            </p>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
              <div>
                <label className="mb-2 block ui-form-label">Latitude <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  className={`common-input ${errors.lat ? "border-red-500" : ""}`}
                  placeholder="31.5204"
                  {...register("lat", {
                    required: "Latitude is required",
                    valueAsNumber: true,
                    min: { value: -90, message: "Latitude must be between -90 and 90" },
                    max: { value: 90, message: "Latitude must be between -90 and 90" },
                  })}
                />
                {errors.lat && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.lat.message}</p>}
              </div>
              <div>
                <label className="mb-2 block ui-form-label">Longitude <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  className={`common-input ${errors.lng ? "border-red-500" : ""}`}
                  placeholder="74.3587"
                  {...register("lng", {
                    required: "Longitude is required",
                    valueAsNumber: true,
                    min: { value: -180, message: "Longitude must be between -180 and 180" },
                    max: { value: 180, message: "Longitude must be between -180 and 180" },
                  })}
                />
                {errors.lng && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.lng.message}</p>}
              </div>
              <div>
                <label className="mb-2 block ui-form-label">Radius (meters) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  className={`common-input ${errors.radius ? "border-red-500" : ""}`}
                  {...register("radius", {
                    required: "Radius is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Radius must be at least 1 meter" },
                  })}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {RADIUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue("radius", preset, { shouldValidate: true })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                        radius === preset
                          ? "bg-primary text-white border-primary"
                          : "border-border-main text-muted-foreground hover:bg-muted-foreground/5"
                      }`}
                    >
                      {preset} m
                    </button>
                  ))}
                </div>
                {errors.radius && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.radius.message}</p>}
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-main/60">
          <Link to={siteRoutes.employees} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-60"
          >
            <Plus size={18} />
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
