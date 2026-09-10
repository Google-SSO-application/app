/**
 * Documents API calls
 */

export async function getDashboard() {
  const response = await fetch("/web/docs/dashboard", { credentials: "include" });
  return response;
}

export async function uploadDocument(file, title, project) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("project", project);

  const response = await fetch("/web/docs/upload", {
    method: "POST",
    body: formData,
  });

  return response;
}

export async function assignReviewer(documentId, reviewerId) {
  return fetch("/web/docs/assign-reviewer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      document_id: documentId,
      reviewer_id: reviewerId,
    }),
  });
}

export async function removeReviewer(documentId) {
  return fetch("/web/docs/remove-reviewer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ document_id: documentId }),
  });
}

export async function getAssignedDocuments() {
  return fetch("/web/docs/reviews", { credentials: "include" });
}

export async function updateReviewStatus(documentId, status) {
  return fetch("/web/docs/reviews/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ document_id: documentId, status }),
  });
}

export async function getGlobalTags() {
  return fetch("/web/tags", { credentials: "include" });
}

export async function createGlobalTag(name) {
  return fetch("/web/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
}

export async function applyTagsToDocument(documentId, tagsArray) {
  return fetch("/web/docs/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      document_id: documentId,
      tags: tagsArray,
    }),
  });
}

export async function getUploadsCount() {
  const response = await fetch("/web/docs/count", {
    method: "GET",
    credentials: "include",
  });
  return response;
}

export async function getPublishedDocuments(projectName) {
  return fetch(`/web/docs/published?project=${encodeURIComponent(projectName)}`, {
    method: "GET",
    credentials: "include",
  });
}

export async function getProjectPublishedCounts() {
  return fetch("/web/docs/counts/projects", {
    method: "GET",
    credentials: "include",
  });
}

export async function searchDocuments(query, projectName) {
  const params = new URLSearchParams({ q: query });
  if (projectName && projectName !== "All projects") {
    params.set("project", projectName);
  }
  return fetch(`/web/docs/search?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });
}
