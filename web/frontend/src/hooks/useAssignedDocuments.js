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
      const data = await response.json();
      setAssignedDocuments(Array.isArray(data) ? data : []);
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
