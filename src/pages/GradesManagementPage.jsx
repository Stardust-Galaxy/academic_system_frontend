import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
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
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import Layout from "../components/Layout";
import "../styles/common.css";

function GradesManagementPage() {
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCourseId = queryParams.get("courseId") || "";
    const initialStudentId = queryParams.get("studentId") || "";

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
    const [selectedStudent, setSelectedStudent] = useState(initialStudentId);
    const [currentGrade, setCurrentGrade] = useState({ studentId: "", courseId: "", grade: "" });
    const [openGradeDialog, setOpenGradeDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courseLoading, setCourseLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch courses taught by the teacher
    useEffect(() => {
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

                // If there's an initial courseId from the URL and it exists in the fetched courses
                if (initialCourseId && data.courses.some(course => course.id === initialCourseId)) {
                    fetchStudents(initialCourseId);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user.token, initialCourseId]);

    // Fetch students enrolled in the selected course
    const fetchStudents = async (courseId) => {
        if (!courseId) {
            setStudents([]);
            setGrades([]);
            return;
        }

        try {
            setCourseLoading(true);
            setError(null);

            // Fetch students enrolled in the course
            const studentsResponse = await fetch(`/api/teacher/courses/${courseId}/students`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!studentsResponse.ok) {
                throw new Error("Failed to fetch enrolled students");
            }

            const studentsData = await studentsResponse.json();
            setStudents(studentsData.students || []);

            // Fetch grades for this course
            const gradesResponse = await fetch(`/api/teacher/courses/${courseId}/grades`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!gradesResponse.ok) {
                throw new Error("Failed to fetch grades");
            }

            const gradesData = await gradesResponse.json();
            setGrades(gradesData.grades || []);

            // If a studentId was provided in the URL, pre-select that student
            if (initialStudentId) {
                setSelectedStudent(initialStudentId);

                // If both courseId and studentId are provided, open the grade dialog
                if (initialCourseId && initialStudentId && !openGradeDialog) {
                    const existingGrade = gradesData.grades?.find(
                        g => g.studentId === initialStudentId && g.courseId === initialCourseId
                    );

                    if (existingGrade) {
                        handleEditGrade(existingGrade);
                    } else {
                        handleAddGrade(initialStudentId, initialCourseId);
                    }
                }
            }

            setCourseLoading(false);
        } catch (err) {
            setError(err.message);
            setCourseLoading(false);
        }
    };

    // Handle course selection change
    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setSelectedStudent("");
        fetchStudents(courseId);
    };

    // Handle student selection change
    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
    };

    // Open dialog to edit an existing grade
    const handleEditGrade = (grade) => {
        setCurrentGrade({...grade});
        setIsEditing(true);
        setOpenGradeDialog(true);
    };

    // Open dialog to add a new grade
    const handleAddGrade = (studentId, courseId) => {
        setCurrentGrade({
            studentId: studentId || selectedStudent,
            courseId: courseId || selectedCourse,
            grade: ""
        });
        setIsEditing(false);
        setOpenGradeDialog(true);
    };

    // Close the grade dialog
    const handleCloseDialog = () => {
        setOpenGradeDialog(false);
    };

    // Handle grade field change
    const handleGradeChange = (e) => {
        setCurrentGrade({
            ...currentGrade,
            grade: e.target.value
        });
    };

    // Save the grade (create or update)
    const handleSaveGrade = async () => {
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `/api/teacher/grades/${currentGrade.id}`
                : "/api/teacher/grades";

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

            // Refresh grades for this course
            const gradesResponse = await fetch(`/api/teacher/courses/${selectedCourse}/grades`, {
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
            setTimeout(() => setError(null), 3000);
        }
    };

    // Get student name by ID
    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.name : "Unknown";
    };

    // Helper function to set grade color based on value
    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return '#4caf50'; // Green
        if (grade.startsWith('B')) return '#2196f3'; // Blue
        if (grade.startsWith('C')) return '#ff9800'; // Orange
        if (grade.startsWith('D')) return '#ff5722'; // Deep Orange
        if (grade === 'F') return '#f44336'; // Red
        return '#757575'; // Grey (default)
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout role="teacher">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">
                        Grades Management
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
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Course</InputLabel>
                                        <Select
                                            value={selectedCourse}
                                            onChange={handleCourseChange}
                                            label="Select Course"
                                            disabled={courseLoading}
                                        >
                                            <MenuItem value="">
                                                <em>Select a course</em>
                                            </MenuItem>
                                            {courses.map(course => (
                                                <MenuItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {selectedCourse && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h5">Students & Grades</Typography>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            placeholder="Search students..."
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

                                    {courseLoading ? (
                                        <Box className="loading-container">
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                            <Table>
                                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                    <TableRow>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Current Grade</TableCell>
                                                        <TableCell>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredStudents.length > 0 ? (
                                                        filteredStudents.map((student) => {
                                                            const studentGrade = grades.find(g =>
                                                                g.studentId === student.id &&
                                                                g.courseId === selectedCourse
                                                            );

                                                            return (
                                                                <TableRow key={student.id} hover>
                                                                    <TableCell>{student.id}</TableCell>
                                                                    <TableCell>{student.name}</TableCell>
                                                                    <TableCell>
                                                                        {studentGrade ? (
                                                                            <Box
                                                                                sx={{
                                                                                    display: 'inline-block',
                                                                                    bgcolor: getGradeColor(studentGrade.grade),
                                                                                    color: 'white',
                                                                                    px: 1.5,
                                                                                    py: 0.5,
                                                                                    borderRadius: 1
                                                                                }}
                                                                            >
                                                                                {studentGrade.grade}
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography color="text.secondary">
                                                                                Not graded
                                                                            </Typography>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {studentGrade ? (
                                                                            <IconButton
                                                                                color="primary"
                                                                                onClick={() => handleEditGrade(studentGrade)}
                                                                                size="small"
                                                                            >
                                                                                <EditIcon />
                                                                            </IconButton>
                                                                        ) : (
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                onClick={() => handleAddGrade(student.id)}
                                                                            >
                                                                                Add Grade
                                                                            </Button>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center">
                                                                {searchTerm
                                                                    ? "No students match your search"
                                                                    : "No students enrolled in this course"}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Grade Dialog */}
            <Dialog open={openGradeDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {isEditing ? "Edit Grade" : "Add Grade"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 1 }}>
                        <Typography variant="body1">
                            <strong>Student:</strong> {getStudentName(currentGrade.studentId)}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Course:</strong> {courses.find(c => c.id === currentGrade.courseId)?.name || ""}
                        </Typography>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={currentGrade.grade}
                                onChange={handleGradeChange}
                                label="Grade"
                            >
                                <MenuItem value="A">A</MenuItem>
                                <MenuItem value="A-">A-</MenuItem>
                                <MenuItem value="B+">B+</MenuItem>
                                <MenuItem value="B">B</MenuItem>
                                <MenuItem value="B-">B-</MenuItem>
                                <MenuItem value="C+">C+</MenuItem>
                                <MenuItem value="C">C</MenuItem>
                                <MenuItem value="C-">C-</MenuItem>
                                <MenuItem value="D+">D+</MenuItem>
                                <MenuItem value="D">D</MenuItem>
                                <MenuItem value="D-">D-</MenuItem>
                                <MenuItem value="F">F</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSaveGrade}
                        variant="contained"
                        disabled={!currentGrade.grade}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default GradesManagementPage;