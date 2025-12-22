import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const RequireAuth = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  // ⏳ Wait until Firebase restores session
  if (user === undefined) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ Logged in
  return children;
};

export default RequireAuth;
