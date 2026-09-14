import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
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

export default function EmployeesEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployeeById, updateEmployee } = useEmployees();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>();

  const radius = Number(watch("radius"));

  useEffect(() => {
    if (!id) return;
    getEmployeeById(id, (employee: any) => {
      reset({
        name: employee.name || "",
        email: employee.email || "",
        address: employee.address || "",
        lat: employee.lat,
        lng: employee.lng,
        radius: employee.radius,
        mobileNumber: employee.mobileNumber || "",
        designation: employee.designation || "",
      });
    });
  }, [id]);

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
              <input className={`common-input ${errors.mobileNumber ? "border-red-500" : ""}`} {...register("mobileNumber", { required: "Mobile number is required" })} />
              {errors.mobileNumber && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.mobileNumber.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Designation <span className="text-red-500">*</span></label>
              <input className={`common-input ${errors.designation ? "border-red-500" : ""}`} {...register("designation", { required: "Designation is required" })} />
              {errors.designation && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.designation.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 block ui-form-label">Address <span className="text-red-500">*</span></label>
            <textarea rows={3} className={`common-input ${errors.address ? "border-red-500" : ""}`} {...register("address", { required: "Address is required" })} />
            {errors.address && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.address.message}</p>}
          </div>
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="mb-2 block ui-form-label">Latitude <span className="text-red-500">*</span></label>
              <input type="number" step="any" className="common-input" {...register("lat", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Longitude <span className="text-red-500">*</span></label>
              <input type="number" step="any" className="common-input" {...register("lng", { required: true, valueAsNumber: true })} />
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
