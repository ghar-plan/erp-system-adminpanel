import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Users,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  FileText,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useVendors from "../useHooks";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";

export default function VendorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVendorById } = useVendors();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    if (id) {
      getVendorById(id, setVendor);
    }
  }, [id]);

  if (!vendor) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/vendors")}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">
              {vendor?.vendorName || "--"}
            </h1>
          </div>
        </div>

        <Link
          to={`/vendors/edit/${vendor.id}`}
          className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
        >
          <Pencil size={16} />
          Edit Profile
        </Link>
      </div>

      <hr className="border-border-main" />

      {/* Profile Card */}
      <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Vendor Profile
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basic contact information and job criteria.
            </p>
          </div>
          <hr className="border-border-main" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                <Users size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Name
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.vendorName || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Job Description
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.jobDescription || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Vendor Type
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.vendorType === "vendorMaterial"
                    ? "Raw Material"
                    : vendor?.vendorType === "vendorLabour"
                      ? "Sub Contractor"
                      : vendor?.vendorType || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Phone
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.phone || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  City
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.city || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Registration No (NTN/FTN)
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.registrationNo || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-panel-bg text-muted-foreground border border-panel-border">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Registration Date
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.created_at
                    ? new Date(vendor.created_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "--"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-border-main" />

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-danger-bg text-danger-text">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Address
              </span>
              <p className="text-sm font-semibold text-foreground mt-1 leading-relaxed">
                {vendor?.address || "No address logged."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
