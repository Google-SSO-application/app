import { useCallback, useEffect, useState } from "react";
import { documents, users } from "../api/index.js";

export default function useReviewers(documentId, onAssignmentSuccess, closePanel, showToast) {
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTeammates = async () => {
      try {
        const response = await users.getTeammates();
        if (!response.ok) throw new Error("Could not retrieve teammate directory registry.");
        const data = await response.json();
        if (active) setTeammates(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load matching workspace reviewers.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTeammates();
    return () => { active = false; };
  }, []);

  const assignReviewer = useCallback(async (reviewerId) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await documents.assignReviewer(documentId, reviewerId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to establish assignment mapping.");
      }
      await onAssignmentSuccess?.();
      showToast?.("Reviewer assigned successfully.");
      closePanel();
    } catch (err) {
      showToast?.(err.message || "Unable to assign reviewer.", "error");
      setError(err.message || "Something went wrong saving reviewer context.");
    } finally {
      setIsSubmitting(false);
    }
  }, [closePanel, documentId, onAssignmentSuccess, showToast]);

  const removeReviewer = useCallback(async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await documents.removeReviewer(documentId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to remove reviewer assignment.");
      }
      await onAssignmentSuccess?.();
      showToast?.("Reviewer assignment removed.");
      closePanel();
    } catch (err) {
      showToast?.(err.message || "Unable to remove reviewer assignment.", "error");
      setError(err.message || "Something went wrong removing reviewer context.");
    } finally {
      setIsSubmitting(false);
    }
  }, [closePanel, documentId, onAssignmentSuccess, showToast]);

  return { teammates, loading, error, isSubmitting, assignReviewer, removeReviewer };
}
