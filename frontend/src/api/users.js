/**
 * User and teammate API calls
 */

export async function getCurrentUser() {
  return fetch("/web/me", {
    credentials: "include",
  });
}

export async function getTeammates() {
  return fetch("/web/users/teammates", {
    credentials: "include",
  });
}
