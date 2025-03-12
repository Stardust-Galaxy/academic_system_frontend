import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Divider,
    Grid,
    Button,
    CardActions
} from "@mui/material";
import { Link } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BookIcon from "@mui/icons-material/Book";
import GradeIcon from "@mui/icons-material/Grade";
import Layout from "../components/Layout";
import "../styles/common.css";

function StudentHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [courseStats, setCourseStats] = useState({enrolled: 0, available: 0});
    const [gradeStats, setGradeStats] = useState({completed: 0, gpa: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch student info
                const infoResponse = await fetch("http://localhost:3000/api/students/info", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!infoResponse.ok) {
                    // Display actual response content for debugging
                    const errorText = await infoResponse.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch student information: ${infoResponse.status}`);
                }
                // else {
                //     console.log("Student info response:", infoResponse.data);
                //     setInfo(infoResponse.data);
                // }


                // Check response content type
                const contentType = infoResponse.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await infoResponse.text();
                    console.error("Non-JSON response:", text);
                    throw new Error("Server returned non-JSON response");
                }

                const infoData = await infoResponse.json();
                setInfo(infoData);

                // Use consistent URL format for all API calls
                const courseResponse = await fetch("http://localhost:3000/api/students/course-stats", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (courseResponse.ok) {
                    const courseData = await courseResponse.json();
                    setCourseStats(courseData);
                }

                // Fix URL path (students plural)
                const gradeResponse = await fetch("http://localhost:3000/api/students/grade-stats", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (gradeResponse.ok) {
                    const gradeData = await gradeResponse.json();
                    setGradeStats(gradeData);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    return (
        <Layout role="student">
            {loading ? (
                <Box className="loading-container">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">Error: {error}</Typography>
            ) : (
                <>
                    <Card className="page-card" sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h4" className="page-title">
                                Welcome, {info.student_name}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box className="info-section">
                                <Typography variant="body1">Student ID: {info.student_id}</Typography>
                                <Typography variant="body1">Major: {info.major}</Typography>
                                <Typography variant="body1">Department: {info.dept_name}</Typography>
                                <Typography variant="body1">Year: {info.year}</Typography>
                                <Typography variant="body1">Tele: {info.tele}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Quick Access
                    </Typography>

                    <Grid container spacing={3} className="dashboard-grid">
                        <Grid item xs={12} md={4}>
                            <Card className="page-card stat-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">My Schedule</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        View your current class schedule and meeting times
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to="/student/schedule"
                                        size="small"
                                        color="primary"
                                    >
                                        View Schedule
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card className="page-card stat-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <BookIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">Course Selection</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Select or drop courses for upcoming terms
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Enrolled Courses: {courseStats.enrolled}
                                        </Typography>
                                        <Typography variant="body2">
                                            Available Courses: {courseStats.available}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to="/student/course-selection"
                                        size="small"
                                        color="primary"
                                    >
                                        Select Courses
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card className="page-card stat-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <GradeIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6">My Grades</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Check your academic performance
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Completed Courses: {gradeStats.completed}
                                        </Typography>
                                        <Typography variant="body2">
                                            Current GPA: {gradeStats.gpa.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to="/student/grades"
                                        size="small"
                                        color="primary"
                                    >
                                        View Grades
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Layout>
    );
}

export default StudentHomepage;