/**
 * Project API calls
 */

export async function createProject(name, description = "") {
  const response = await fetch("/web/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, description }),
  });

  return response;
}

export async function getProjects() {
  const response = await fetch("/web/projects", {
    method: "GET",
    credentials: "include",
  });

  return response;
}