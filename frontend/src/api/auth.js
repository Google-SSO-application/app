/**
 * Authentication API calls
 */

export async function getSession() {
  const response = await fetch("/web/me", { credentials: "include" });
  return response;
}

export async function refreshToken() {
  const response = await fetch("/web/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  return response;
}

export async function logout() {
  return fetch("/web/auth/logout", { 
    method: "POST", 
    credentials: "include" 
  }).catch(() => {});
}
