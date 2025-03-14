import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    TextField,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Layout from "../components/Layout";
import "../styles/common.css";

function CourseSelectionPage() {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);

            // Fetch enrolled courses
            const enrolledResponse = await fetch(`http://localhost:3000/api/students/enrolled-courses`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!enrolledResponse.ok) {
                throw new Error("Failed to fetch enrolled courses");
            }

            const enrolledData = await enrolledResponse.json();
            // Check if data exists in response or use the whole response
            setEnrolledCourses(enrolledData.data || []);

            // Fetch available courses
            const availableResponse = await fetch(`http://localhost:3000/api/students/available-courses`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!availableResponse.ok) {
                throw new Error("Failed to fetch available courses");
            }

            const availableData = await availableResponse.json();
            console.log(availableData.data);
            // Check if data exists in response or use the whole response
            setAvailableCourses(availableData.data|| []);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user.token]);

    const handleEnroll = async (courseId, sectionId, semester, year) => {
        try {
            console.log("Enrolling with data:", { courseId, sectionId, semester, year });

            // Create payload with consistent naming that matches your database fields
            const payload = {
                course_id: courseId,
                sec_id: sectionId,
                semester: semester,
                year: year
            };

            console.log("Sending enrollment request with payload:", payload);

            const response = await fetch("http://localhost:3000/api/students/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload),
            });

            console.log("Enrollment response status:", response.status);

            const data = await response.json();
            console.log("Response data:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to enroll in course");
            }

            setSuccess("Successfully enrolled in course");
            setTimeout(() => setSuccess(null), 3000);

            // Refresh course lists
            fetchCourses();
        } catch (err) {
            console.error("Enrollment error:", err);
            setError(err.message || "Network error during enrollment");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDrop = async (courseId, sectionId, semester, year) => {
        if (window.confirm("Are you sure you want to drop this course?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/students/drop`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ courseId, sectionId, semester, year }),
                });

                if (!response.ok) {
                    throw new Error("Failed to drop course");
                }

                setSuccess("Course dropped successfully");
                setTimeout(() => setSuccess(null), 3000);

                // Refresh course lists
                fetchCourses();
            } catch (err) {
                setError(err.message);
                setTimeout(() => setError(null), 3000);
            }
        }
    };


    const filteredAvailableCourses = availableCourses.filter(course =>
        (course.course_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout role="student">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">
                        Course Selection
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>Error: {error}</Alert>}

                    {loading ? (
                        <Box className="loading-container">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    My Enrolled Courses
                                </Typography>

                                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                            <TableRow>
                                                <TableCell>Course Name</TableCell>
                                                <TableCell>Instructor</TableCell>
                                                <TableCell>Credits</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Semester</TableCell>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {enrolledCourses.length > 0 ? (
                                                enrolledCourses.map((course) => (
                                                    <TableRow key={course.course_id} hover>
                                                        <TableCell>{course.course_name}</TableCell>
                                                        <TableCell>{course.teacher_name || "Not assigned"}</TableCell>
                                                        <TableCell>{course.credits}</TableCell>
                                                        <TableCell>{`${course.building} ${course.room_number}`}</TableCell>
                                                        <TableCell>{`${course.semester} ${course.year}`}</TableCell>
                                                        <TableCell>{`${course.day} ${course.start_time}-${course.end_time}`}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleDrop(course.course_id, course.sec_id, course.semester, course.year)}
                                                            >
                                                                Drop
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">You are not enrolled in any courses yet</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h5">Available Courses</Typography>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                            <TableRow>
                                                <TableCell>Course Name</TableCell>
                                                <TableCell>Instructor</TableCell>
                                                <TableCell>Credits</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Semester</TableCell>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredAvailableCourses.length > 0 ? (
                                                filteredAvailableCourses.map((course) => (
                                                    <TableRow key={course.course_id} hover>
                                                        <TableCell>{course.course_name}</TableCell>
                                                        <TableCell>{course.teacher_name || "Not assigned"}</TableCell>
                                                        <TableCell>{course.credits}</TableCell>
                                                        <TableCell>{`${course.building} ${course.room_number}`}</TableCell>
                                                        <TableCell>{`${course.semester} ${course.year}`}</TableCell>
                                                        <TableCell>{`${course.day} ${course.start_time}-${course.end_time}`}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outlined"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => handleEnroll(course.course_id, course.sec_id, course.semester, course.year)}
                                                            >
                                                                Enroll
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No available courses found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}

export default CourseSelectionPage;