import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography, Box, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Alert, DialogContentText, FormControl, InputLabel, MenuItem, Select,
    Card, CardContent
} from "@mui/material";
import Layout from "../components/Layout";
import "../styles/common.css";

function CourseManagementPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newStudent, setNewStudent] = useState({
        studentId: "",
        secId: "1",
        semester: "spring",
        year: "2025"
    });
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [user.token]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/teachers/courses", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch courses");
            const data = await response.json();
            setCourses(data.data || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchCourseStudents = async (course) => {
        try {
            setLoadingStudents(true);
            const response = await fetch(
                `http://localhost:3000/api/teachers/course_students/${course.course_id}/${course.sec_id}/${course.semester}/${course.year}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            if (!response.ok) throw new Error("Failed to fetch students");
            const data = await response.json();
            setStudents(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleViewStudents = (course) => {
        setSelectedCourse(course);
        fetchCourseStudents(course);
    };

    const handleAddStudent = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/teachers/course_student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...newStudent,
                    courseId: selectedCourse.course_id
                })
            });

            if (!response.ok) throw new Error("Failed to add student to course");

            await fetchCourseStudents(selectedCourse);
            setSuccess("Student added to course successfully");
            setOpenAddStudent(false);
            setNewStudent({
                studentId: "",
                secId: "1",
                semester: "Fall",
                year: "2024"
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Layout role="teacher">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">Course Management</Typography>
                    <Divider sx={{ mb: 3 }} />

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    {loading ? (
                        <Box className="loading-container"><CircularProgress /></Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Course ID</TableCell>
                                        <TableCell>Course Name</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Credits</TableCell>
                                        <TableCell>Section</TableCell>
                                        <TableCell>Semester</TableCell>
                                        <TableCell>Year</TableCell>
                                        <TableCell>Building</TableCell>
                                        <TableCell>Room</TableCell>
                                        <TableCell>Capacity</TableCell>
                                        <TableCell>Actions</TableCell>  {/* Only one Actions column */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {courses.map((course) => (
                                        <TableRow key={course.course_id}>
                                            <TableCell>{course.course_id}</TableCell>
                                            <TableCell>{course.course_name}</TableCell>
                                            <TableCell>{course.dept_name}</TableCell>
                                            <TableCell>{course.credits}</TableCell>
                                            <TableCell>{course.sec_id}</TableCell>
                                            <TableCell>{course.semester}</TableCell>
                                            <TableCell>{course.year}</TableCell>
                                            <TableCell>{course.building || 'N/A'}</TableCell>
                                            <TableCell>{course.room_number || 'N/A'}</TableCell>
                                            <TableCell>{course.capacity || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleViewStudents(course)}
                                                >
                                                    View Students
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {selectedCourse && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                Students in {selectedCourse.course_name}
                                <Button
                                    variant="contained"
                                    sx={{ float: 'right' }}
                                    onClick={() => setOpenAddStudent(true)}
                                >
                                    Add Student
                                </Button>
                            </Typography>

                            {loadingStudents ? (
                                <Box className="loading-container"><CircularProgress /></Box>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Student ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Major</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Sec_ID</TableCell>
                                                <TableCell>Year</TableCell>
                                                <TableCell>Semester</TableCell>
                                                <TableCell>Grade</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student.student_id}>
                                                    <TableCell>{student.student_id}</TableCell>
                                                    <TableCell>{student.student_name}</TableCell>
                                                    <TableCell>{student.major}</TableCell>
                                                    <TableCell>{student.dept_name}</TableCell>
                                                    <TableCell>{student.sec_id}</TableCell>
                                                    <TableCell>{student.year}</TableCell>
                                                    <TableCell>{student.semester}</TableCell>
                                                    <TableCell>{student.grade || 'Not graded'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog open={openAddStudent} onClose={() => setOpenAddStudent(false)}>
                <DialogTitle>Add Student to Course</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Student ID"
                        value={newStudent.studentId}
                        onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Section</InputLabel>
                        <Select
                            value={newStudent.secId}
                            onChange={(e) => setNewStudent({ ...newStudent, secId: e.target.value })}
                            label="Section"
                        >
                            <MenuItem value="1">Section 1</MenuItem>
                            <MenuItem value="2">Section 2</MenuItem>
                            <MenuItem value="4">Section 4</MenuItem>
                            <MenuItem value="5">Section 5</MenuItem>
                            <MenuItem value="6">Section 6</MenuItem>
                            <MenuItem value="7">Section 7</MenuItem>
                            <MenuItem value="8">Section 8</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Semester</InputLabel>
                        <Select
                            value={newStudent.semester}
                            onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                            label="Semester"
                        >
                            <MenuItem value="Fall">Fall</MenuItem>
                            <MenuItem value="Spring">Spring</MenuItem>
                            <MenuItem value="Summer">Summer</MenuItem>
                            <MenuItem value="Winter">Winter</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={newStudent.year}
                            onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                            label="Year"
                        >
                            <MenuItem value="2024">2024</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                            <MenuItem value="2026">2026</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddStudent(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddStudent}
                        variant="contained"
                        disabled={!newStudent.studentId}
                    >
                        Add Student
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default CourseManagementPage;