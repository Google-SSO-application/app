import { useCallback, useEffect, useState } from "react";
import { documents } from "../api/index.js";

export default function useUploadDocs(s, refreshUploadedDocs, refreshProjects) {
  const [masterTags, setMasterTags] = useState([]);
  const [newTagFields, setNewTagFields] = useState([""]);
  const [tagError, setTagError] = useState("");


const refreshMasterTags = useCallback(async () => {
    if (!s.signedIn) return;
    try {
      const response = await documents.getGlobalTags();
      if (response.ok) {
        const data = await response.json();
        setMasterTags((data || []).map(t => ({ ...t, active: false })));
      }
    } catch (err) {
      console.error("Could not fetch system tags directory:", err);
    }
  }, [s.signedIn]);

  useEffect(() => {
    if (s.authReady && s.signedIn) {
      refreshMasterTags();
    }
  }, [s.authReady, s.signedIn, refreshMasterTags]);

  const toggleMasterTagSelection = useCallback((tagName) => {
    setMasterTags((prev) => prev.map(t => t.name === tagName ? { ...t, active: !t.active } : t));
  }, []);

  const handleTagFieldChange = useCallback((index, value) => {
    setNewTagFields((prev) => prev.map((f, i) => i === index ? value : f));
  }, []);

  const addAnotherTagField = useCallback(() => {
    setNewTagFields((prev) => [...prev, ""]);
  }, []);

  const removeTagField = useCallback((index) => {
    setNewTagFields((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const resetTagFieldsForm = useCallback(() => {
    setNewTagFields([""]);
    setMasterTags((prev) => prev.map(t => ({ ...t, active: false })));
    setTagError("");
  }, []);

  return {
    masterTags,
    newTagFields,
    tagError,
    setTagError,
    toggleMasterTagSelection,
    handleTagFieldChange,
    addAnotherTagField,
    removeTagField,
    resetTagFieldsForm,
    refreshUploadedDocs: async () => {
      await refreshUploadedDocs();
      await refreshProjects();
      await refreshMasterTags();
    }
  };
}