import React, { useEffect, useRef, useState } from "react";
import { Plus, Loader2, FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useClientContracts from "../useHooks";
import useProjects from "../../projects/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { errorToaster } from "@/utils/helpers/common/alert-service";

interface ClientContractFormInputs {
  projectId: string;
  mediaId: string;
  pdfUrl: string;
}

export default function ClientContractCreate() {
  const navigate = useNavigate();
  const { createClientContract, uploadContractPdf } = useClientContracts();
  const { getAllProjects } = useProjects();
  const { isLoading } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientContractFormInputs>({
    defaultValues: {
      projectId: "",
      mediaId: "",
      pdfUrl: "",
    },
  });

  const pdfUrl = watch("pdfUrl");
  const mediaId = watch("mediaId");

  useEffect(() => {
    getAllProjects(setProjects);
  }, []);

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      errorToaster("Please upload a PDF file");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errorToaster("Contract PDF must not be greater than 10 MB");
      e.target.value = "";
      return;
    }

    setUploadingPdf(true);
    const mediaObj = await uploadContractPdf(file);
    if (mediaObj) {
      setValue("mediaId", mediaObj.id, { shouldDirty: true, shouldValidate: true });
      setValue(
        "pdfUrl",
        mediaObj.url
          ? getFilePathWithBackendUrl(mediaObj.url)
          : URL.createObjectURL(file),
        { shouldDirty: true },
      );
    }
    setUploadingPdf(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmitForm = async (data: ClientContractFormInputs) => {
    await createClientContract({
      projectId: data.projectId,
      mediaId: data.mediaId,
    });
  };

  const goToBack = () => {
    navigate(-1);
  };

  return (
    <div>
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
          <h1 className="text-2xl text-foreground font-bold">
            Create Client Contract
          </h1>
        </div>
      </div>

      <form
        id="client-contract-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-6 max-w-3xl w-full animate-slide-up bg-card border border-border-main rounded-xl shadow-xs"
      >
        <div className="p-6 md:p-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Project
            </label>
            <select
              className={`common-input w-full ${errors.projectId ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("projectId", { required: "Project is required" })}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.siteName}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Contract PDF
            </label>
            <input
              type="hidden"
              {...register("mediaId", { required: "Contract PDF is required" })}
            />
            <label className="block cursor-pointer group">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
                disabled={uploadingPdf}
              />
              <div className="relative w-full h-11 rounded-md border border-dashed border-border-input hover:border-primary/50 flex items-center px-4 gap-3 transition-all duration-200 overflow-hidden bg-bg-input">
                {uploadingPdf ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin text-primary" size={16} />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                ) : pdfUrl || mediaId ? (
                  <>
                    <FileText className="text-primary shrink-0" size={18} />
                    <span className="text-sm font-medium text-foreground truncate">
                      Contract PDF attached
                    </span>
                    {pdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto text-sm text-primary font-semibold hover:underline shrink-0"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="ml-auto text-xs text-muted-foreground shrink-0">
                        Click to replace
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Upload size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Upload PDF (max 10 MB)
                    </span>
                  </>
                )}
              </div>
            </label>
            {errors.mediaId && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">
                {errors.mediaId.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 md:px-8 py-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || uploadingPdf}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Plus size={18} />
                Create Client Contract
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
