import { useState } from "react";
import { uploadImage } from "../lib/firebase";

export default function LogoUploader({ onUpdate }: { onUpdate: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  const currentLogo = localStorage.getItem("siteLogo") || "/logo.png";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const result = await uploadImage(file, "brand");
    if (result.success && result.url) {
      localStorage.setItem("siteLogo", result.url);
      onUpdate(result.url);
    } else {
      alert("Upload failed: " + (result.error || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Brand Logo</h3>
      <p className="text-xs text-gray-500 mb-4">Recommended: 200×200px, PNG or SVG. Auto-compressed on upload.</p>
      <div className="flex items-center gap-4">
        <img src={currentLogo} alt="Logo" className="h-16 w-16 object-contain border rounded-xl bg-gray-50" />
        <div className="space-y-2">
          <label className="cursor-pointer inline-flex px-4 py-2 bg-[#5E0B1D] text-white rounded-lg text-sm font-medium hover:bg-[#4a0917] transition">
            {loading ? "Uploading..." : "Upload New Logo"}
            <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={handleUpload} />
          </label>
          <p className="text-[10px] text-gray-400">PNG, SVG, JPEG or WebP</p>
        </div>
      </div>
    </div>
  );
}
