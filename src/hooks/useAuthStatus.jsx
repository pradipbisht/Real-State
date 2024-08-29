import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setCheckingStatus(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  return { loggedIn, checkingStatus };
}
