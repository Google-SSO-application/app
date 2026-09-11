import { useCallback, useEffect, useState } from "react";
import { documents } from "../api/index.js";

export function useUploads(signedIn) {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState("");
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0);

  const refreshUploadedDocs = useCallback(async () => {
    if (!signedIn) return;

    setUploadsLoading(true);
    setUploadsError("");

    try {
      const [docsResponse, countResponse] = await Promise.all([
        documents.getDashboard(),
        documents.getUploadsCount(),
      ]);

      if (!docsResponse.ok) {
        throw new Error("Unable to load your uploads.");
      }

      const docs = await docsResponse.json();

      setUploadedDocs(
        Array.isArray(docs)
          ? docs.map((document) => ({
            ...document,
            projectName:
              document.projectName ||
              document.project_name ||
              "Unassigned",
            fileType:
              document.fileType ||
              document.file_type ||
              "",
            fileName:
              document.fileName ||
              document.file_name ||
              document.title ||
              "Untitled document",
            createdAt:
              document.createdAt ||
              document.created_at ||
              "",
          }))
          : []
      );

      if (countResponse.ok) {
        const data = await countResponse.json();
        setUploadedDocsCount(
          typeof data.count === "number" ? data.count : 0
        );
      }
    } catch (error) {
      setUploadsError(error.message || "Unable to load your uploads.");
    } finally {
      setUploadsLoading(false);
    }
  }, [signedIn]);

  const refreshCount = useCallback(async () => {
    if (!signedIn) return;
    try {
      const response = await documents.getUploadsCount();
      if (response.ok) {
        const data = await response.json();
        setUploadedDocsCount(typeof data.count === "number" ? data.count : 0);
      }
    } catch (err) {
      console.error("Could not fetch user uploads count:", err);
    }
  }, [signedIn]);

  useEffect(() => {
    if (signedIn) {
      refreshCount();
    } else {
      setUploadedDocsCount(0);
      setUploadedDocs([]);
    }
  }, [signedIn, refreshCount]);

  return { uploadedDocs, uploadsLoading, uploadsError, uploadedDocsCount, refreshUploadedDocs, refreshCount };
}
