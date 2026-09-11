import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (adminOnly) {
    if (!user || !user.is_staff) return <Navigate to="/admin/login" replace />;
    return children;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
