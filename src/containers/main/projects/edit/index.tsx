import React, { useEffect, useState } from "react";
import { Upload, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useProjects from "../useHooks";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { IoArrowBackOutline } from "react-icons/io5";

interface ProjectFormInputs {
  siteName: string;
  region: string;
  subregion: string;
  mediaId: string | null;
}

export default function ProjectsEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, updateProject, uploadImage } = useProjects();
  const { isLoading } = useStore();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInputs>();

  useEffect(() => {
    if (id) {
      getProjectById(id, (project: any) => {
        reset({
          siteName: project.siteName,
          region: project.region,
          subregion: project.subregion,
          mediaId: project.mediaId || project.media?.id || null,
        });
        if (project.media?.url) {
          setPreviewImageUrl(getFilePathWithBackendUrl(project.media.url));
        }
      });
    }
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImageUrl(URL.createObjectURL(file));
    setUploadingImage(true);

    const mediaObj = await uploadImage(file);
    if (mediaObj) {
      setValue("mediaId", mediaObj.id, { shouldValidate: true });
      if (mediaObj.url) {
        setPreviewImageUrl(getFilePathWithBackendUrl(mediaObj.url));
      }
    } else {
      setPreviewImageUrl(null);
      setValue("mediaId", null, { shouldValidate: true });
    }
    setUploadingImage(false);
  };

  const onSubmitForm = async (data: ProjectFormInputs) => {
    if (id) {
      const payload: any = {
        siteName: data.siteName,
        region: data.region,
        subregion: data.subregion,
      };
      if (data.mediaId) {
        payload.mediaId = data.mediaId;
      }
      await updateProject(id, payload);
    }
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
            Modify Site Information
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="project-edit-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <input
          type="hidden"
          {...register("mediaId", { required: "Cover image is required" })}
        />
        <hr className="border-border-main" />

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
          {/* LEFT COLUMN: Input Fields */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block ui-form-label">Site Name</label>
              <input
                type="text"
                placeholder="e.g., Al-Hafiz Heights"
                className={`common-input ${errors.siteName ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("siteName", {
                  required: "Site Name is required",
                })}
              />
              {errors.siteName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.siteName.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block ui-form-label">
                  Region or City
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lahore"
                  className={`common-input ${errors.region ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("region", {
                    required: "Region/City is required",
                  })}
                />
                {errors.region && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.region.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">Subregion</label>
                <input
                  type="text"
                  placeholder="e.g., Johar Town"
                  className={`common-input ${errors.subregion ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("subregion", {
                    required: "Subregion is required",
                  })}
                />
                {errors.subregion && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.subregion.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Cover Image Upload Field inside the same card */}
          <div className="flex flex-col">
            <label className="mb-2 block ui-form-label">Site Cover Image</label>

            <label className="flex-1 flex flex-col justify-center items-center cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />

              <div
                className={`relative w-full h-48 md:h-full min-h-[192px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50 ${
                  errors.mediaId
                    ? "border-red-500/60 hover:border-red-500"
                    : "border-border-input hover:border-primary/50"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="animate-spin text-primary" size={28} />
                    <span className="text-xs font-semibold">Uploading...</span>
                  </div>
                ) : previewImageUrl ? (
                  <>
                    <img
                      src={previewImageUrl}
                      alt="Site cover preview"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                      <Upload size={20} className="stroke-[2]" />
                      <span className="text-xs font-semibold">
                        Change Cover Image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-2">
                    <Upload
                      size={26}
                      className="text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2 stroke-[1.5]"
                    />
                    <span className="text-xs font-bold text-foreground">
                      Upload Image
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </span>
                    <span className="text-[10px] text-red-500 font-semibold mt-1">
                      * Required
                    </span>
                  </div>
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

        {/* Action Button inside the form card */}
        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
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
