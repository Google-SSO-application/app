import { useCallback, useState } from "react";
import { documents } from "../api/index.js";

export function useUploads(signedIn) {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState("");

  const refreshUploadedDocs = useCallback(async () => {
    if (!signedIn) return;
    setUploadsLoading(true);
    setUploadsError("");
    try {
      const response = await documents.getDashboard();
      if (!response.ok) throw new Error("Unable to load your uploads.");
      const docs = await response.json();
      setUploadedDocs(Array.isArray(docs) ? docs.map((document) => ({
        ...document,
        projectName: document.projectName || document.project_name || "Unassigned",
        fileType: document.fileType || document.file_type || "",
        fileName: document.fileName || document.file_name || document.title || "Untitled document",
        createdAt: document.createdAt || document.created_at || "",
      })) : []);
    } catch (error) {
      setUploadsError(error.message || "Unable to load your uploads.");
    } finally {
      setUploadsLoading(false);
    }
  }, [signedIn]);

  return { uploadedDocs, uploadsLoading, uploadsError, refreshUploadedDocs };
}
