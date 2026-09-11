import { useCallback, useState } from "react";
import { documents } from "../api/index.js";

export default function useAssignedDocuments(signedIn) {
  const [assignedDocuments, setAssignedDocuments] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedError, setAssignedError] = useState("");

  const refreshAssignedDocuments = useCallback(async () => {
    if (!signedIn) return;
    setAssignedLoading(true);
    setAssignedError("");
    try {
      const response = await documents.getAssignedDocuments();
      if (!response.ok) throw new Error("Unable to load assigned documents.");
      const docs = await response.json();
      setAssignedDocuments(Array.isArray(docs) ? docs.map((document) => ({
        ...document,
        projectName: document.projectName || document.project_name || "Unassigned",
        fileType: document.fileType || document.file_type || "",
        fileName: document.fileName || document.file_name || document.title || "Untitled document",
        createdAt: document.createdAt || document.created_at || "",
      })) : []);
    } catch (error) {
      setAssignedError(error.message || "Unable to load assigned documents.");
    } finally {
      setAssignedLoading(false);
    }
  }, [signedIn]);

  const updateReviewStatus = useCallback(async (documentId, status) => {
    const response = await documents.updateReviewStatus(documentId, status);
    if (!response.ok) throw new Error((await response.text()) || "Unable to update review status.");
    await refreshAssignedDocuments();
  }, [refreshAssignedDocuments]);

  return { assignedDocuments, assignedLoading, assignedError, refreshAssignedDocuments, updateReviewStatus };
}
