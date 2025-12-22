import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;

  // If user not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected page
  return children;
};

export default ProtectedRoute;
