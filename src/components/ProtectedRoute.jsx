import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
    const { user } = useAuth();
    if (!user || user.role !== role) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default ProtectedRoute;