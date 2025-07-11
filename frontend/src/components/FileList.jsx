import { useEffect, useState } from "react";
import axios from "axios";

export default function FileList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchFiles() {
      const res = await axios.get("/api/files");
      console.log("Files fetched:", res.data); 
      setFiles(res.data.files);
    }
    fetchFiles();
  }, []);

  return (
    <div className="mt-8 w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Uploaded Files:</h2>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file._id}
            className="p-2 border rounded-md flex justify-between items-center"
          >
            <span className="truncate w-2/3">{file.originalName}</span>
            <a
               href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
