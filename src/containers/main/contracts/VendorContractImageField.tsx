import { FileText, Loader2, Upload } from "lucide-react";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

export default function VendorContractImageField({
  previewUrl,
  uploading,
  onFileChange,
  fileName,
}: {
  previewUrl: string | null;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string | null;
}) {
  const isPdf =
    !!previewUrl &&
    (previewUrl.toLowerCase().includes(".pdf") ||
      previewUrl.toLowerCase().includes("application/pdf") ||
      (fileName || "").toLowerCase().endsWith(".pdf"));

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        Award Document{" "}
        <span className="text-xs font-medium text-muted-foreground">
          (PDF optional — leave empty if not uploaded)
        </span>
      </label>
      <label className="block cursor-pointer group">
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={onFileChange}
          className="hidden"
          disabled={uploading}
        />
        <div className="relative w-full h-36 rounded-xl border-2 border-dashed border-border-input hover:border-primary/50 flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="animate-spin text-primary" size={22} />
              <span className="text-xs font-semibold">Uploading...</span>
            </div>
          ) : previewUrl ? (
            isPdf ? (
              <div className="flex flex-col items-center gap-2 p-2">
                <FileText size={28} className="text-primary" />
                <span className="text-xs font-bold text-foreground truncate max-w-full px-2">
                  {fileName || "Award PDF uploaded"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Click to change
                </span>
              </div>
            ) : (
              <>
                <img
                  src={
                    previewUrl.startsWith("http") || previewUrl.startsWith("blob:")
                      ? previewUrl
                      : getFilePathWithBackendUrl(previewUrl)
                  }
                  alt="Award document"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                  <Upload size={18} className="stroke-[2]" />
                  <span className="text-xs font-semibold">Change Document</span>
                </div>
              </>
            )
          ) : (
            <div className="flex flex-col items-center p-2">
              <Upload
                size={22}
                className="text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2 stroke-[1.5]"
              />
              <span className="text-xs font-bold text-foreground">
                Upload Award PDF
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                PDF or image, optional — skip if not available
              </span>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
