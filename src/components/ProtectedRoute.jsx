// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
    const { user } = useAuth();

    if (!user) {
        // If not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
        // If logged in but wrong role, redirect to appropriate home
        return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
}

export default ProtectedRoute;