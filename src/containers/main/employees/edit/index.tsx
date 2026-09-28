import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { OFFICE_LOCATION } from "@/utils/helpers/constants";
import useEmployees from "../useHooks";
import useProjects from "../../projects/useHooks";
import {
  PAKISTAN_MOBILE_PLACEHOLDER,
  validatePakistanMobile,
} from "@/utils/helpers/common/phone";
import type { EmployeeType } from "@/utils/helpers/models/employees/employee.dto";

type LocationMode = "office" | "custom";

type EmployeeForm = {
  name: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  mobileNumber: string;
  designation: string;
  employeeType: EmployeeType;
  projectId: string;
};

const RADIUS_PRESETS = [10, 50, 100];

const isSameCoord = (a: number, b: number) =>
  Number(a).toFixed(6) === Number(b).toFixed(6);

export default function EmployeesEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployeeById, updateEmployee } = useEmployees();
  const { getAllProjects } = useProjects();
  const [projects, setProjects] = useState<any[]>([]);
  const [locationMode, setLocationMode] = useState<LocationMode>("custom");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>();

  const radius = Number(watch("radius"));
  const employeeType = watch("employeeType");
  const isOfficeLocation = locationMode === "office";

  useEffect(() => {
    getAllProjects(setProjects);
  }, []);

  useEffect(() => {
    if (!id) return;
    getEmployeeById(id, (employee: any) => {
      const matchesOffice =
        isSameCoord(employee.lat, OFFICE_LOCATION.lat) &&
        isSameCoord(employee.lng, OFFICE_LOCATION.lng);
      setLocationMode(matchesOffice ? "office" : "custom");
      reset({
        name: employee.name || "",
        email: employee.email || "",
        address: employee.address || "",
        lat: employee.lat,
        lng: employee.lng,
        radius: employee.radius,
        mobileNumber: employee.mobileNumber || "",
        designation: employee.designation || "",
        employeeType: employee.employeeType || "Permanent",
        projectId: employee.projectId || employee.project?.id || "",
      });
    });
  }, [id]);

  const applyOfficeLocation = () => {
    setLocationMode("office");
    setValue("lat", OFFICE_LOCATION.lat, { shouldValidate: true });
    setValue("lng", OFFICE_LOCATION.lng, { shouldValidate: true });
    clearErrors(["lat", "lng"]);
  };

  const switchToCustomLocation = () => {
    setLocationMode("custom");
    setValue("lat", undefined as unknown as number, { shouldValidate: false });
    setValue("lng", undefined as unknown as number, { shouldValidate: false });
    clearErrors(["lat", "lng"]);
  };

  const handleLocationModeChange = (mode: LocationMode) => {
    if (mode === "office") {
      applyOfficeLocation();
    } else {
      switchToCustomLocation();
    }
  };

  const onSubmit = async (form: EmployeeForm) => {
    if (!id) return;
    await updateEmployee(id, {
      name: form.name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      radius: Number(form.radius),
      mobileNumber: form.mobileNumber.trim(),
      designation: form.designation.trim(),
      employeeType: form.employeeType,
      ...(form.employeeType === "Temporary"
        ? { projectId: form.projectId }
        : { projectId: null }),
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
          <h1 className="text-2xl text-foreground font-bold">Edit Employee</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full space-y-6 animate-slide-up" noValidate>
        <hr className="border-border-main" />
        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Employee Type <span className="text-red-500">*</span>
              </label>
              <select
                className={`common-input ${errors.employeeType ? "border-red-500" : ""}`}
                {...register("employeeType", { required: "Employee type is required" })}
              >
                <option value="Permanent">Permanent (Office / Supervision)</option>
                <option value="Temporary">Temporary (Chaukidar)</option>
              </select>
              {errors.employeeType && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.employeeType.message}</p>
              )}
            </div>

            {employeeType === "Temporary" ? (
              <div>
                <label className="mb-2 block ui-form-label">
                  Project (salary charged to) <span className="text-red-500">*</span>
                </label>
                <select
                  className={`common-input ${errors.projectId ? "border-red-500" : ""}`}
                  {...register("projectId", {
                    required: "Project is required for temporary employees",
                  })}
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.siteName}
                      {project.status ? ` (${project.status})` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Salary ends when this project is completed or closed.
                </p>
                {errors.projectId && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.projectId.message}</p>
                )}
              </div>
            ) : (
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground pb-2">
                  Permanent employees remain on company salary (office &amp; supervision staff).
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block ui-form-label">Name <span className="text-red-500">*</span></label>
              <input className={`common-input ${errors.name ? "border-red-500" : ""}`} {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Email <span className="text-red-500">*</span></label>
              <input type="email" className={`common-input ${errors.email ? "border-red-500" : ""}`} {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Mobile Number <span className="text-red-500">*</span></label>
              <input
                className={`common-input ${errors.mobileNumber ? "border-red-500" : ""}`}
                placeholder={PAKISTAN_MOBILE_PLACEHOLDER}
                {...register("mobileNumber", {
                  required: "Mobile number is required",
                  validate: (v) => validatePakistanMobile(v),
                })}
              />
              {errors.mobileNumber && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.mobileNumber.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Designation <span className="text-red-500">*</span></label>
              <input
                className={`common-input ${errors.designation ? "border-red-500" : ""}`}
                placeholder={employeeType === "Temporary" ? "e.g., Chaukidar" : "e.g., Site Engineer"}
                {...register("designation", { required: "Designation is required" })}
              />
              {errors.designation && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.designation.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 block ui-form-label">Address <span className="text-red-500">*</span></label>
            <textarea rows={3} className={`common-input ${errors.address ? "border-red-500" : ""}`} {...register("address", { required: "Address is required" })} />
            {errors.address && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.address.message}</p>}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Attendance location</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The employee can only check in or out within this radius of the configured coordinates.
            </p>

            <div className="mb-4 space-y-3">
              <label className="mb-2 block ui-form-label">
                Location type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <label
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-semibold cursor-pointer transition-all ${
                    isOfficeLocation
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border-main text-muted-foreground hover:bg-muted-foreground/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="locationMode"
                    className="accent-primary"
                    checked={isOfficeLocation}
                    onChange={() => handleLocationModeChange("office")}
                  />
                  Office Location
                </label>
                <label
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-semibold cursor-pointer transition-all ${
                    !isOfficeLocation
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border-main text-muted-foreground hover:bg-muted-foreground/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="locationMode"
                    className="accent-primary"
                    checked={!isOfficeLocation}
                    onChange={() => handleLocationModeChange("custom")}
                  />
                  Custom Location
                </label>
              </div>

              {!isOfficeLocation && (
                <button
                  type="button"
                  onClick={applyOfficeLocation}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-all cursor-pointer"
                >
                  <MapPin size={16} />
                  Add Office Lat/Lng
                </button>
              )}

              {isOfficeLocation && (
                <p className="text-xs text-muted-foreground">
                  Using {OFFICE_LOCATION.label} coordinates. Latitude and longitude are locked and cannot be edited.
                </p>
              )}
            </div>

            <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
              <div>
                <label className="mb-2 block ui-form-label">Latitude <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  readOnly={isOfficeLocation}
                  className={`common-input ${errors.lat ? "border-red-500" : ""} ${
                    isOfficeLocation ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""
                  }`}
                  {...register("lat", { required: "Latitude is required", valueAsNumber: true })}
                />
                {errors.lat && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.lat.message}</p>}
              </div>
              <div>
                <label className="mb-2 block ui-form-label">Longitude <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  readOnly={isOfficeLocation}
                  className={`common-input ${errors.lng ? "border-red-500" : ""} ${
                    isOfficeLocation ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""
                  }`}
                  {...register("lng", { required: "Longitude is required", valueAsNumber: true })}
                />
                {errors.lng && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.lng.message}</p>}
              </div>
              <div>
                <label className="mb-2 block ui-form-label">Radius (meters) <span className="text-red-500">*</span></label>
                <input type="number" min={1} className="common-input" {...register("radius", { required: true, valueAsNumber: true, min: 1 })} />
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
            <Save size={18} />
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
