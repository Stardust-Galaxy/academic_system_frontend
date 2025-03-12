import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Divider,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Layout from "../components/Layout";
import "../styles/common.css";

function AdminControlPage() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [openCourseDialog, setOpenCourseDialog] = useState(false);
    const [openGradeDialog, setOpenGradeDialog] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({ name: "", instructor: "", time: "", location: "", capacity: 30 });
    const [currentGrade, setCurrentGrade] = useState({ studentId: "", courseId: "", grade: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Fetch all data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch courses
                const coursesResponse = await fetch("/api/admin/courses", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!coursesResponse.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.courses || []);

                // Fetch students
                const studentsResponse = await fetch("/api/admin/students", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!studentsResponse.ok) {
                    throw new Error("Failed to fetch students");
                }
                const studentsData = await studentsResponse.json();
                setStudents(studentsData.students || []);

                // Fetch grades
                const gradesResponse = await fetch("/api/admin/grades", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!gradesResponse.ok) {
                    throw new Error("Failed to fetch grades");
                }
                const gradesData = await gradesResponse.json();
                setGrades(gradesData.grades || []);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    // Course functions
    const handleOpenCourseDialog = (course = null) => {
        if (course) {
            setCurrentCourse(course);
            setIsEditing(true);
        } else {
            setCurrentCourse({ name: "", instructor: "", time: "", location: "", capacity: 30 });
            setIsEditing(false);
        }
        setOpenCourseDialog(true);
    };

    const handleCloseCourseDialog = () => {
        setOpenCourseDialog(false);
    };

    const handleCourseChange = (e) => {
        setCurrentCourse({
            ...currentCourse,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveCourse = async () => {
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `/api/admin/courses/${currentCourse.id}` : "/api/admin/courses";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentCourse)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? "update" : "create"} course`);
            }

            // Refresh courses
            const coursesResponse = await fetch("/api/admin/courses", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!coursesResponse.ok) {
                throw new Error("Failed to refresh courses");
            }

            const coursesData = await coursesResponse.json();
            setCourses(coursesData.courses || []);
            setSuccess(`Course ${isEditing ? "updated" : "created"} successfully`);

            setTimeout(() => setSuccess(null), 3000);
            setOpenCourseDialog(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                const response = await fetch(`/api/admin/courses/${courseId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete course");
                }

                // Update courses state by removing the deleted course
                setCourses(courses.filter(course => course.id !== courseId));
                setSuccess("Course deleted successfully");
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Grade functions
    const handleOpenGradeDialog = (grade = null) => {
        if (grade) {
            setCurrentGrade(grade);
            setIsEditing(true);
        } else {
            setCurrentGrade({ studentId: "", courseId: "", grade: "" });
            setIsEditing(false);
        }
        setOpenGradeDialog(true);
    };

    const handleCloseGradeDialog = () => {
        setOpenGradeDialog(false);
    };

    const handleGradeChange = (e) => {
        setCurrentGrade({
            ...currentGrade,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveGrade = async () => {
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `/api/admin/grades/${currentGrade.id}` : "/api/admin/grades";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentGrade)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? "update" : "create"} grade`);
            }

            // Refresh grades
            const gradesResponse = await fetch("/api/admin/grades", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!gradesResponse.ok) {
                throw new Error("Failed to refresh grades");
            }

            const gradesData = await gradesResponse.json();
            setGrades(gradesData.grades || []);
            setSuccess(`Grade ${isEditing ? "updated" : "created"} successfully`);

            setTimeout(() => setSuccess(null), 3000);
            setOpenGradeDialog(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteGrade = async (gradeId) => {
        if (window.confirm("Are you sure you want to delete this grade record?")) {
            try {
                const response = await fetch(`/api/admin/grades/${gradeId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete grade");
                }

                // Update grades state by removing the deleted grade
                setGrades(grades.filter(grade => grade.id !== gradeId));
                setSuccess("Grade deleted successfully");
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Find student and course names by ID
    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.name : "Unknown";
    };

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : "Unknown";
    };

    return (
        <Layout role="admin">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">
                        Admin Control Panel
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>Error: {error}</Alert>}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Course Management" />
                            <Tab label="Grades Management" />
                        </Tabs>
                    </Box>

                    {loading ? (
                        <Box className="loading-container">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            {tabValue === 0 && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Course List</Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => handleOpenCourseDialog()}
                                        >
                                            Add Course
                                        </Button>
                                    </Box>
                                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                        <Table>
                                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Course Name</TableCell>
                                                    <TableCell>Instructor</TableCell>
                                                    <TableCell>Time</TableCell>
                                                    <TableCell>Location</TableCell>
                                                    <TableCell>Capacity</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {courses.map((course) => (
                                                    <TableRow key={course.id} hover>
                                                        <TableCell>{course.id}</TableCell>
                                                        <TableCell>{course.name}</TableCell>
                                                        <TableCell>{course.instructor}</TableCell>
                                                        <TableCell>{course.time}</TableCell>
                                                        <TableCell>{course.location}</TableCell>
                                                        <TableCell>{course.capacity}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleOpenCourseDialog(course)} size="small">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDeleteCourse(course.id)} size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {courses.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center">No courses found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {tabValue === 1 && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Student Grades</Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => handleOpenGradeDialog()}
                                        >
                                            Add Grade
                                        </Button>
                                    </Box>
                                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                        <Table>
                                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Student</TableCell>
                                                    <TableCell>Course</TableCell>
                                                    <TableCell>Grade</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {grades.map((grade) => (
                                                    <TableRow key={grade.id} hover>
                                                        <TableCell>{grade.id}</TableCell>
                                                        <TableCell>{getStudentName(grade.studentId)}</TableCell>
                                                        <TableCell>{getCourseName(grade.courseId)}</TableCell>
                                                        <TableCell>{grade.grade}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleOpenGradeDialog(grade)} size="small">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDeleteGrade(grade.id)} size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {grades.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center">No grades found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Course Dialog */}
            <Dialog open={openCourseDialog} onClose={handleCloseCourseDialog}>
                <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Course Name"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.name}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="instructor"
                        label="Instructor"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.instructor}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="time"
                        label="Time"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.time}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="location"
                        label="Location"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.location}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="capacity"
                        label="Capacity"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.capacity}
                        onChange={handleCourseChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCourseDialog}>Cancel</Button>
                    <Button onClick={handleSaveCourse} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Grade Dialog */}
            <Dialog open={openGradeDialog} onClose={handleCloseGradeDialog}>
                <DialogTitle>{isEditing ? "Edit Grade" : "Add New Grade"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Student</InputLabel>
                        <Select
                            name="studentId"
                            value={currentGrade.studentId}
                            onChange={handleGradeChange}
                            label="Student"
                        >
                            {students.map(student => (
                                <MenuItem key={student.id} value={student.id}>
                                    {student.name} ({student.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Course</InputLabel>
                        <Select
                            name="courseId"
                            value={currentGrade.courseId}
                            onChange={handleGradeChange}
                            label="Course"
                        >
                            {courses.map(course => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        name="grade"
                        label="Grade"
                        fullWidth
                        variant="outlined"
                        value={currentGrade.grade}
                        onChange={handleGradeChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGradeDialog}>Cancel</Button>
                    <Button onClick={handleSaveGrade} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminControlPage;