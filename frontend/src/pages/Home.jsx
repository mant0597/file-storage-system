import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">📁 File Storage</h1>
      <FileUpload />
      <FileList />
    </div>
  );
}
