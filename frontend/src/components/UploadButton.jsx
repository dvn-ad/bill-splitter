import { useRef } from "react";
import { Camera } from "lucide-react";

export default function UploadButton({ onUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result.split(",")[1];
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset
  };

  return (
    <div className="flex-none">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-10 h-10 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600 transition-all active:scale-90 shadow-sm"
        title="Upload Receipt"
      >
        <Camera className="w-5 h-5" />
      </button>
    </div>
  );
}
