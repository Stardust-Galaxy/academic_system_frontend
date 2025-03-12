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
    CardActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import { Link } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import GradeIcon from "@mui/icons-material/Grade";
import Layout from "../components/Layout";
import "../styles/common.css";

function TeacherHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [courseStats, setCourseStats] = useState({ total: 0, students: 0 });
    const [recentCourses, setRecentCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch teacher info
                const infoResponse = await fetch("/api/teacher/info", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!infoResponse.ok) {
                    throw new Error("Failed to fetch teacher information");
                }

                const infoData = await infoResponse.json();
                setInfo(infoData);

                // Fetch course statistics
                const statsResponse = await fetch("/api/teacher/course-stats", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setCourseStats(statsData);
                }

                // Fetch recent courses
                const coursesResponse = await fetch("/api/teacher/courses?recent=true", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setRecentCourses(coursesData.courses || []);
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
        <Layout role="teacher">
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
                                Welcome, {info.name}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box className="info-section">
                                <Typography variant="body1">Teacher ID: {info.id}</Typography>
                                <Typography variant="body1">Department: {info.department}</Typography>
                                <Typography variant="body1">Email: {info.email}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Dashboard
                    </Typography>

                    <Grid container spacing={3} className="dashboard-grid">
                        <Grid item xs={12} md={6}>
                            <Card className="page-card stat-card">
                                <CardContent>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        <BookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        My Courses
                                    </Typography>
                                    <Typography variant="h3">{courseStats.total}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Courses currently teaching
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to="/teacher/course-management"
                                        size="small"
                                        color="primary"
                                    >
                                        Manage Courses
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card className="page-card stat-card">
                                <CardContent>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        Students
                                    </Typography>
                                    <Typography variant="h3">{courseStats.students}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Total enrolled students
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to="/teacher/grades-management"
                                        size="small"
                                        color="primary"
                                    >
                                        Manage Grades
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                        My Courses
                    </Typography>

                    <Card className="page-card">
                        <CardContent>
                            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell>Course Name</TableCell>
                                            <TableCell>Schedule</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Students</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentCourses.length > 0 ? (
                                            recentCourses.map((course) => (
                                                <TableRow key={course.id} hover>
                                                    <TableCell>{course.name}</TableCell>
                                                    <TableCell>{course.time}</TableCell>
                                                    <TableCell>{course.location}</TableCell>
                                                    <TableCell>{course.enrolledCount}/{course.capacity}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            component={Link}
                                                            to={`/teacher/grades-management?courseId=${course.id}`}
                                                            startIcon={<GradeIcon />}
                                                        >
                                                            Grades
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No courses found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {recentCourses.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        component={Link}
                                        to="/teacher/course-management"
                                        color="primary"
                                    >
                                        View All Courses
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </Layout>
    );
}

export default TeacherHomepage;