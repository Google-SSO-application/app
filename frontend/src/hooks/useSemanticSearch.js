import { useState, useEffect, useRef } from "react";
import { documents } from "../api/index.js";

export function useSemanticSearch(query, project, signedIn) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!signedIn) return;
    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await documents.searchDocuments(trimmed, project);
        if (!response.ok) throw new Error("Search failed.");
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setSearchError(err.message || "Search failed.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, project, signedIn]);

  return { searchResults, searchLoading, searchError };
}