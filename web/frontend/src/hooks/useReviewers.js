import { useCallback, useEffect, useState } from "react";
import { documents, users } from "../api/index.js";

export default function useReviewers(documentId, onAssignmentSuccess, closePanel) {
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
      closePanel();
    } catch (err) {
      setError(err.message || "Something went wrong saving reviewer context.");
    } finally {
      setIsSubmitting(false);
    }
  }, [closePanel, documentId, onAssignmentSuccess]);

  return { teammates, loading, error, isSubmitting, assignReviewer };
}
