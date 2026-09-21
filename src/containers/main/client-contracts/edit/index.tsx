import React, { useEffect, useRef, useState } from "react";
import { Loader2, Save, FileText, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
  drawingMediaId: string;
  pdfUrl: string;
  drawingUrl: string;
}

export default function ClientContractEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getClientContractById,
    updateClientContract,
    uploadContractPdf,
  } = useClientContracts();
  const { getAllProjects } = useProjects();
  const { isLoading } = useStore();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const drawingInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingDrawing, setUploadingDrawing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClientContractFormInputs>({
    defaultValues: {
      projectId: "",
      mediaId: "",
      drawingMediaId: "",
      pdfUrl: "",
      drawingUrl: "",
    },
  });

  const pdfUrl = watch("pdfUrl");
  const mediaId = watch("mediaId");
  const drawingUrl = watch("drawingUrl");
  const drawingMediaId = watch("drawingMediaId");

  useEffect(() => {
    const fetchInitialData = async () => {
      getAllProjects(setProjects);

      if (id) {
        await getClientContractById(id, (data: any) => {
          reset({
            projectId: data.projectId || data.project?.id,
            mediaId: data.mediaId || data.media?.id || "",
            drawingMediaId:
              data.drawingMediaId || data.drawingMedia?.id || "",
            pdfUrl: data.media?.url
              ? getFilePathWithBackendUrl(data.media.url)
              : "",
            drawingUrl: data.drawingMedia?.url
              ? getFilePathWithBackendUrl(data.drawingMedia.url)
              : "",
          });
          setInitialDataLoading(false);
        });
      }
    };
    fetchInitialData();
  }, [id]);

  const validateAtLeastOneFile = () => {
    const hasPdf = Boolean(watch("mediaId")?.trim());
    const hasDrawing = Boolean(watch("drawingMediaId")?.trim());
    return hasPdf || hasDrawing || "Upload a drawing PDF or contract PDF. At least one is required.";
  };

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
      await trigger(["mediaId", "drawingMediaId"]);
    }
    setUploadingPdf(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleDrawingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      errorToaster("Please upload a PDF file for the drawing");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errorToaster("Drawing PDF must not be greater than 10 MB");
      e.target.value = "";
      return;
    }

    setUploadingDrawing(true);
    const mediaObj = await uploadContractPdf(file);
    if (mediaObj) {
      setValue("drawingMediaId", mediaObj.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(
        "drawingUrl",
        mediaObj.url
          ? getFilePathWithBackendUrl(mediaObj.url)
          : URL.createObjectURL(file),
        { shouldDirty: true },
      );
      await trigger(["mediaId", "drawingMediaId"]);
    }
    setUploadingDrawing(false);
    if (drawingInputRef.current) {
      drawingInputRef.current.value = "";
    }
  };

  const onSubmitForm = async (data: ClientContractFormInputs) => {
    if (id) {
      await updateClientContract(id, {
        projectId: data.projectId,
        mediaId: data.mediaId?.trim() || null,
        drawingMediaId: data.drawingMediaId?.trim() || null,
      });
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  if (initialDataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const uploading = uploadingPdf || uploadingDrawing;

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
            Edit Client Contract
          </h1>
        </div>
      </div>

      <form
        id="client-contract-edit-form"
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
            <p className="text-sm font-semibold text-foreground">Attachments</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a drawing PDF, a contract PDF, or both. At least one file is required.
            </p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Drawing PDF
              </label>
              <input
                type="hidden"
                {...register("drawingMediaId", {
                  validate: validateAtLeastOneFile,
                })}
              />
              <label className="block cursor-pointer group">
                <input
                  ref={drawingInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleDrawingChange}
                  className="hidden"
                  disabled={uploadingDrawing}
                />
                <div
                  className={`relative w-full min-h-[132px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50 ${
                    errors.drawingMediaId && !drawingMediaId && !mediaId
                      ? "border-red-500/60"
                      : "border-border-input hover:border-primary/50"
                  }`}
                >
                  {uploadingDrawing ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                      <Loader2 className="animate-spin text-primary" size={22} />
                      <span className="text-xs font-semibold">Uploading...</span>
                    </div>
                  ) : drawingUrl || drawingMediaId ? (
                    <div className="flex flex-col items-center gap-2 p-2">
                      <FileText className="text-primary" size={22} />
                      <span className="text-xs font-bold text-foreground">
                        Drawing PDF attached
                      </span>
                      {drawingUrl ? (
                        <a
                          href={drawingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          View Drawing PDF
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Click to replace
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-2">
                      <Upload
                        size={22}
                        className="text-muted-foreground group-hover:text-primary mb-2"
                      />
                      <span className="text-xs font-bold text-foreground">
                        Upload Drawing PDF
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        PDF up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Contract PDF
              </label>
              <input
                type="hidden"
                {...register("mediaId", {
                  validate: validateAtLeastOneFile,
                })}
              />
              <label className="block cursor-pointer group">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                  disabled={uploadingPdf}
                />
                <div
                  className={`relative w-full min-h-[132px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50 ${
                    errors.mediaId && !drawingMediaId && !mediaId
                      ? "border-red-500/60"
                      : "border-border-input hover:border-primary/50"
                  }`}
                >
                  {uploadingPdf ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                      <Loader2 className="animate-spin text-primary" size={22} />
                      <span className="text-xs font-semibold">Uploading...</span>
                    </div>
                  ) : pdfUrl || mediaId ? (
                    <div className="flex flex-col items-center gap-2 p-2">
                      <FileText className="text-primary" size={22} />
                      <span className="text-xs font-bold text-foreground">
                        PDF attached
                      </span>
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Click to replace
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-2">
                      <Upload
                        size={22}
                        className="text-muted-foreground group-hover:text-primary mb-2"
                      />
                      <span className="text-xs font-bold text-foreground">
                        Upload PDF
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        PDF up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {(errors.mediaId || errors.drawingMediaId) &&
          !mediaId &&
          !drawingMediaId ? (
            <p className="text-xs text-red-500 font-semibold">
              {(errors.mediaId?.message ||
                errors.drawingMediaId?.message) as string}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end px-6 md:px-8 py-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || uploading}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
