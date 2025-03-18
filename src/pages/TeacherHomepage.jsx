import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import Layout from "../components/Layout";
import "../styles/common.css";

function TeacherHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const infoResponse = await fetch("http://localhost:3000/api/teachers/info", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!infoResponse.ok) {
                    throw new Error("Failed to fetch teacher information");
                }

                const infoData = await infoResponse.json();
                setInfo(infoData);

                const coursesResponse = await fetch("http://localhost:3000/api/teachers/courses", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!coursesResponse.ok) {
                    throw new Error("Failed to fetch courses");
                }

                const coursesData = await coursesResponse.json();
                // Filter unique courses based on course_id
                const uniqueCourses = Array.from(
                    coursesData.data.reduce((map, course) => {
                        if (!map.has(course.course_id)) {
                            map.set(course.course_id, course);
                        }
                        return map;
                    }, new Map()).values()
                );
                setCourses(uniqueCourses);

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
                                Welcome, {info.teacher_name}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box className="info-section">
                                <Typography variant="body1">Teacher ID: {info.teacher_id}</Typography>
                                <Typography variant="body1">Department: {info.dept_name}</Typography>

                                <Typography variant="body1">Telephone: {info.tele}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="h5" sx={{ mb: 2 }}>
                        My Courses
                    </Typography>

                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell>Course Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Credits</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <TableRow key={course.course_id} hover>
                                            <TableCell>{course.course_name}</TableCell>
                                            <TableCell>{course.dept_name}</TableCell>
                                            <TableCell>{course.credits}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">No courses found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Layout>
    );
}

export default TeacherHomepage;