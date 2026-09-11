import { useState, useEffect, useCallback } from "react";
import { documents } from "../api/index.js";


export function usePublishedDocs(selectedProject, signedIn) {
  const [publishedDocs, setPublishedDocs] = useState([]);
  const [projectCounts, setProjectCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshPublishedDocs = useCallback(async () => {
    if (!signedIn) return;
    setLoading(true);
    try {
      const response = await documents.getPublishedDocuments(selectedProject);
      if (!response.ok) throw new Error("Failed to fetch matching published workspace documents.");
      const docs = await response.json();
      setPublishedDocs(Array.isArray(docs) ? docs.map((document) => ({
        ...document,
        projectName: document.projectName || document.project_name || "Unassigned",
        fileType: document.fileType || document.file_type || "",
        fileName: document.fileName || document.file_name || document.title || "Untitled document",
        createdAt: document.createdAt || document.created_at || "",
      })) : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, signedIn]);

  const refreshCounts = useCallback(async () => {
    if (!signedIn) return;
    try {
      const response = await documents.getProjectPublishedCounts();
      if (!response.ok) throw new Error("Failed to load project database metrics counters.");
      const data = await response.json();
      
      const countsMap = {};
      let totalAllProjectsCount = 0;
      
      data.forEach(item => {
        countsMap[item.project_name] = item.count;
        totalAllProjectsCount += item.count;
      });
      countsMap["All projects"] = totalAllProjectsCount;
      
      setProjectCounts(countsMap);
    } catch (err) {
      console.error("Counters sync failure:", err);
    }
  }, [signedIn]);

  useEffect(() => {
    refreshPublishedDocs();
    refreshCounts();
  }, [refreshPublishedDocs, refreshCounts]);

  return {
    publishedDocs,
    projectCounts,
    publishedLoading: loading,
    publishedError: error,
    refreshPublishedData: async () => {
      await Promise.all([refreshPublishedDocs(), refreshCounts()]);
    }
  };
}
