import { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("/api/upload", formData, {
        onUploadProgress: (p) => {
          setProgress(Math.round((p.loaded * 100) / p.total));
        },
      });
      alert("File uploaded!");
      setFile(null);
      setProgress(0);
      setUploading(false);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white w-full max-w-md mx-auto">
      <input type="file" onChange={handleChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? `Uploading... ${progress}%` : "Upload"}
      </button>
    </div>
  );
}
