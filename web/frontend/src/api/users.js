/**
 * User and teammate API calls
 */

export async function getTeammates() {
  return fetch("/web/users/teammates", {
    credentials: "include",
  });
}
