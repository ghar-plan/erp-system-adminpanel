import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useVendors from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";

interface VendorFormInputs {
  vendorName: string;
  jobDescription: string;
  vendorType: "Raw Material" | "Sub Contractor" | "Both";
  address: string;
  phone: string;
  city: string;
}

export default function VendorCreate() {
  const navigate = useNavigate();
  const { createVendor } = useVendors();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormInputs>({
    defaultValues: {
      vendorType: "Both",
    },
  });

  const onSubmitForm = async (data: VendorFormInputs) => {
    const payload = {
      vendorName: data.vendorName,
      jobDescription: data.jobDescription,
      vendorType: data.vendorType,
      ...(data.address ? { address: data.address } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.city ? { city: data.city } : {}),
    };
    await createVendor(payload);
  };

  const goToBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToBack}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold  ">
            Register New Vendor
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="vendor-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full space-y-6 animate-slide-up"
      >
        <hr className="border-border-main" />

        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Vendor Name</label>
              <input
                type="text"
                placeholder="e.g., Aslam"
                className={`common-input ${errors.vendorName ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("vendorName", {
                  required: "Vendor Name is required",
                })}
              />
              {errors.vendorName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.vendorName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">
                Job Description
              </label>
              <input
                type="text"
                placeholder="e.g., Electrician"
                className={`common-input ${errors.jobDescription ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("jobDescription", {
                  required: "Job Description is required",
                })}
              />
              {errors.jobDescription && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
            <div>
              <label className="mb-2 block ui-form-label">Vendor Type</label>
              <select
                className={`common-input ${errors.vendorType ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("vendorType", {
                  required: "Vendor Type is required",
                })}
              >
                <option value="Both">Both</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Sub Contractor">Sub Contractor</option>
              </select>
              {errors.vendorType && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.vendorType.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Phone Number</label>
              <input
                type="text"
                placeholder="e.g., +923001234567"
                className="common-input"
                {...register("phone")}
              />
            </div>

            <div>
              <label className="mb-2 block ui-form-label">City</label>
              <input
                type="text"
                placeholder="e.g., Lahore"
                className="common-input"
                {...register("city")}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Address</label>
            <textarea
              placeholder="e.g., 123 Main St, Lahore"
              rows={3}
              className="common-input py-2 resize-none"
              {...register("address")}
            />
          </div>
        </div>

        {/* Action Button inside the form card */}
        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <Plus size={18} />
            Add Vendor
          </button>
        </div>
      </form>
    </div>
  );
}
