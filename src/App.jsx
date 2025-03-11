import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import StudentHomepage from "./pages/StudentHomepage";
import TeacherHomepage from "./pages/TeacherHomepage";
import AdminHomepage from "./pages/AdminHomepage";
import SchedulePage from "./pages/SchedulePage";
import CourseSelectionPage from "./pages/CourseSelectionPage";
import GradesQueryPage from "./pages/GradesQueryPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import GradesManagementPage from "./pages/GradesManagementPage";
import AdminControlPage from "./pages/AdminControlPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/student" element={<ProtectedRoute role="student"><StudentHomepage /></ProtectedRoute>} />
                    <Route path="/student/schedule" element={<ProtectedRoute role="student"><SchedulePage /></ProtectedRoute>} />
                    <Route path="/student/course-selection" element={<ProtectedRoute role="student"><CourseSelectionPage /></ProtectedRoute>} />
                    <Route path="/student/grades" element={<ProtectedRoute role="student"><GradesQueryPage /></ProtectedRoute>} />
                    <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherHomepage /></ProtectedRoute>} />
                    <Route path="/teacher/course-management" element={<ProtectedRoute role="teacher"><CourseManagementPage /></ProtectedRoute>} />
                    <Route path="/teacher/grades-management" element={<ProtectedRoute role="teacher"><GradesManagementPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminHomepage /></ProtectedRoute>} />
                    <Route path="/admin/control" element={<ProtectedRoute role="admin"><AdminControlPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;