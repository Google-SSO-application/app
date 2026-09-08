import { useCallback, useEffect, useState } from "react";
import { auth } from "../api/index.js";

export function useAuth() {
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        let response = await auth.getSession();
        if (response.status === 401) {
          const refresh = await auth.refreshToken();
          if (refresh.ok) response = await auth.getSession();
        }
        if (!active) return;
        setSignedIn(response.ok);
        setAuthReady(true);
        setAuthError("");
      } catch {
        if (!active) return;
        setSignedIn(false);
        setAuthReady(true);
        setAuthError("Unable to connect to Atlas.");
      }
    };

    loadSession();
    return () => { active = false; };
  }, []);

  const signIn = useCallback(() => {
    window.location.assign("/web/auth/google/login");
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout();
    setSignedIn(false);
  }, []);

  return {
    signedIn,
    signedOut: authReady && !signedIn,
    authReady,
    authError,
    signIn,
    signOut,
  };
}
