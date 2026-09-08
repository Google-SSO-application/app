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
