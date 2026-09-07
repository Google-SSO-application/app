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
