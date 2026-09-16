import { Loader2, Upload } from "lucide-react";

export default function VendorContractImageField({
  previewUrl,
  uploading,
  onFileChange,
}: {
  previewUrl: string | null;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        Image{" "}
        <span className="text-xs font-medium text-muted-foreground">
          (optional)
        </span>
      </label>
      <label className="block cursor-pointer group">
        <input
          type="file"
          accept="image/*"
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
            <>
              <img
                src={previewUrl}
                alt="Contract attachment"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                <Upload size={18} className="stroke-[2]" />
                <span className="text-xs font-semibold">Change Image</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center p-2">
              <Upload
                size={22}
                className="text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2 stroke-[1.5]"
              />
              <span className="text-xs font-bold text-foreground">
                Upload Image
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                PNG, JPG up to 10MB (optional)
              </span>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
