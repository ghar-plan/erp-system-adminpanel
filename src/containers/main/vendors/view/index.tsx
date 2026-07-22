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
  Wallet,
  Banknote,
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

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        {/* Total Contracts */}
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Total Contracts</p>
              <h3 className="text-2xl font-bold text-foreground">
                {vendor?.contracts?.length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Decided Amount */}
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-info-bg flex items-center justify-center text-info-text">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Decided Amount (PKR)</p>
              <h3 className="text-2xl font-bold text-foreground">
                {(vendor?.contracts?.reduce((sum, c) => sum + Number(c.amount || 0), 0) || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Cash Given */}
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success-text">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Cash Given (PKR)</p>
              <h3 className="text-2xl font-bold text-foreground">
                {(vendor?.cashflowsOut?.reduce((sum, c) => sum + Number(c.amount || 0), 0) || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

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

      {/* Contracts Card */}
      {vendor?.contracts && vendor.contracts.length > 0 && (
        <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Contracts Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed view of contracts assigned to this vendor.
              </p>
            </div>
            <hr className="border-border-main" />

            <div className="grid grid-cols-1 gap-4">
              {vendor.contracts.map((contract: any, index: number) => {
                // Calculate cash given for this specific contract based on matching project and activity
                const cashGiven = vendor.cashflowsOut
                  ?.filter(
                    (cf: any) =>
                      cf.projectId === contract.projectId &&
                      cf.activityId === contract.activityId
                  )
                  .reduce((sum: number, cf: any) => sum + Number(cf.amount || 0), 0) || 0;

                return (
                  <div key={contract.id || index} className="p-4 rounded-xl border border-border-main bg-panel-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-primary/30">
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Briefcase size={16} className="text-primary" />
                        {contract.project?.siteName || "Unknown Project"} - {contract.activity?.name || "Unknown Activity"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                        {contract.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Decided</span>
                        <span className="font-semibold text-info-text block text-sm">
                          PKR {Number(contract.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Cash Given</span>
                        <span className="font-semibold text-success-text block text-sm">
                          PKR {cashGiven.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
