import { useCallback, useEffect, useState } from "react";
import { users } from "../api/index.js";

export function useCurrentUser(signedIn) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(!!signedIn);

  const refreshCurrentUser = useCallback(async () => {
    if (!signedIn) {
      setCurrentUser(null);
      setCurrentUserLoading(false);
      return;
    }

    setCurrentUserLoading(true);
    try {
      const response = await users.getCurrentUser();
      if (!response.ok) {
        throw new Error("Unable to verify user session metadata properties.");
      }
      
      const data = await response.json();
      setCurrentUser(data);
      setCurrentUserError(null);
    } catch (err) {
      setCurrentUserError(err.message || "Failed to load current active session profile.");
      setCurrentUser(null);
    } finally {
      setCurrentUserLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  return { 
    currentUser, 
    currentUserError, 
    currentUserLoading, 
    refreshCurrentUser 
  };
}
