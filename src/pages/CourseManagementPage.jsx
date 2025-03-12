import React, { useState, useEffect } from "react";
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
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Alert,
    Collapse,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from "@mui/material";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import GradeIcon from "@mui/icons-material/Grade";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import Layout from "../components/Layout";
import "../styles/common.css";

function CourseManagementPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentCourse, setCurrentCourse] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState({});
    const [loadingStudents, setLoadingStudents] = useState({});

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/teacher/courses", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await response.json();
            setCourses(data.courses || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user.token]);

    const handleEditCourse = (course) => {
        setCurrentCourse({...course});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCourseChange = (e) => {
        setCurrentCourse({
            ...currentCourse,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveCourse = async () => {
        try {
            const response = await fetch(`/api/teacher/courses/${currentCourse.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentCourse)
            });

            if (!response.ok) {
                throw new Error("Failed to update course");
            }

            // Refresh course list
            await fetchCourses();

            setSuccess("Course updated successfully");
            setTimeout(() => setSuccess(null), 3000);
            setOpenDialog(false);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleExpandCourse = async (courseId) => {
        // Toggle expanded state
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
            return;
        }

        setExpandedCourseId(courseId);

        // If we haven't loaded students for this course yet, load them
        if (!enrolledStudents[courseId]) {
            try {
                setLoadingStudents({...loadingStudents, [courseId]: true});

                const response = await fetch(`/api/teacher/courses/${courseId}/students`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch enrolled students");
                }

                const data = await response.json();
                setEnrolledStudents({...enrolledStudents, [courseId]: data.students || []});
                setLoadingStudents({...loadingStudents, [courseId]: false});
            } catch (err) {
                setError(err.message);
                setLoadingStudents({...loadingStudents, [courseId]: false});
            }
        }
    };

    return (
        <Layout role="teacher">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">
                        Course Management
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
                            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell>Course Name</TableCell>
                                            <TableCell>Schedule</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Enrollment</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {courses.length > 0 ? (
                                            courses.map((course) => (
                                                <React.Fragment key={course.id}>
                                                    <TableRow hover>
                                                        <TableCell>{course.name}</TableCell>
                                                        <TableCell>{course.time}</TableCell>
                                                        <TableCell>{course.location}</TableCell>
                                                        <TableCell>{course.enrolledCount}/{course.capacity}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditCourse(course)}
                                                                    title="Edit course details"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleExpandCourse(course.id)}
                                                                    color={expandedCourseId === course.id ? "primary" : "default"}
                                                                    title="View enrolled students"
                                                                >
                                                                    <PeopleIcon />
                                                                </IconButton>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    component={Link}
                                                                    to={`/teacher/grades-management?courseId=${course.id}`}
                                                                    startIcon={<GradeIcon />}
                                                                >
                                                                    Grades
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                            <Collapse in={expandedCourseId === course.id} timeout="auto" unmountOnExit>
                                                                <Box sx={{ margin: 1 }}>
                                                                    <Typography variant="h6" gutterBottom component="div">
                                                                        Enrolled Students
                                                                    </Typography>
                                                                    {loadingStudents[course.id] ? (
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                                            <CircularProgress size={24} />
                                                                        </Box>
                                                                    ) : (
                                                                        <Table size="small" aria-label="enrolled students">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell>ID</TableCell>
                                                                                    <TableCell>Name</TableCell>
                                                                                    <TableCell>Email</TableCell>
                                                                                    <TableCell>Major</TableCell>
                                                                                    <TableCell>Action</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {enrolledStudents[course.id]?.length > 0 ? (
                                                                                    enrolledStudents[course.id].map((student) => (
                                                                                        <TableRow key={student.id} hover>
                                                                                            <TableCell>{student.id}</TableCell>
                                                                                            <TableCell>{student.name}</TableCell>
                                                                                            <TableCell>{student.email}</TableCell>
                                                                                            <TableCell>{student.major}</TableCell>
                                                                                            <TableCell>
                                                                                                <Button
                                                                                                    size="small"
                                                                                                    variant="outlined"
                                                                                                    component={Link}
                                                                                                    to={`/teacher/grades-management?courseId=${course.id}&studentId=${student.id}`}
                                                                                                >
                                                                                                    Enter Grade
                                                                                                </Button>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))
                                                                                ) : (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={5} align="center">No students enrolled</TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    )}
                                                                </Box>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No courses found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Course Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Edit Course Details</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="name"
                        label="Course Name"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.name || ""}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="time"
                        label="Schedule"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.time || ""}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="location"
                        label="Location"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.location || ""}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={currentCourse.description || ""}
                        onChange={handleCourseChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveCourse} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default CourseManagementPage;