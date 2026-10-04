import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import useDesignVendors from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import { validatePakistanMobile } from "@/utils/helpers/common/phone";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";

interface VendorFormInputs {
  vendorName: string;
  jobDescription: string;
  address: string;
  phone: string;
  city: string;
}

export default function DesignVendorCreate() {
  const navigate = useNavigate();
  const { createVendor, getServices } = useDesignVendors();
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormInputs>();

  useEffect(() => {
    getServices(setServices);
  }, []);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onSubmitForm = async (data: VendorFormInputs) => {
    const payload = {
      vendorName: data.vendorName,
      jobDescription: data.jobDescription,
      phone: data.phone.trim(),
      ...(data.address ? { address: data.address } : {}),
      ...(data.city ? { city: data.city } : {}),
      serviceIds: selectedServiceIds,
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
            Create Vendor
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="design-vendor-create-form"
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
              <label className="mb-2 block ui-form-label">Address</label>
              <input
                type="text"
                placeholder="e.g., 123 Main St, Lahore"
                className="common-input"
                {...register("address")}
              />
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  validate: (value) => validatePakistanMobile(value),
                }}
                render={({ field }) => (
                  <PakistanPhoneInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.phone}
                  />
                )}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.phone.message}
                </p>
              )}
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
            <label className="mb-2 block ui-form-label">Services</label>
            <div className="rounded-xl border border-border-main p-4 bg-muted-foreground/5 max-h-56 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No services yet. Use Create Service on the vendors page to add some.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="rounded border-border-main"
                      />
                      {service.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Job Description</label>
            <textarea
              placeholder="e.g., Electrician"
              rows={3}
              className={`common-input py-2 resize-none ${errors.jobDescription ? "border-red-500 focus:border-red-500" : ""}`}
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

        {/* Action Button inside the form card */}
        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <Plus size={18} />
            Create Vendor
          </button>
        </div>
      </form>
    </div>
  );
}
