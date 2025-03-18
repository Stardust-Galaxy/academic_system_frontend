import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography, Card, CardContent, Box, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, Select, MenuItem, Alert
} from "@mui/material";
import Layout from "../components/Layout";
import "../styles/common.css";

function GradesManagementPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openGradeDialog, setOpenGradeDialog] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState("");

    const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

    useEffect(() => {
        fetchCourses();
    }, [user.token]);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudentGrades();
        }
    }, [selectedCourse?.course_id, selectedCourse?.sec_id, selectedCourse?.semester, selectedCourse?.year]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/teachers/courses", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch courses");
            const data = await response.json();
            setCourses(data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchStudentGrades = async () => {
        try {
            if (!selectedCourse) return;

            console.log('Fetching grades for course:', selectedCourse);

            const response = await fetch(
                `http://localhost:3000/api/teachers/course_grades/${selectedCourse.course_id}/${selectedCourse.sec_id}/${selectedCourse.semester}/${selectedCourse.year}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch student grades");
            }

            const data = await response.json();
            console.log('Received students data:', data);

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch student grades");
            }

            setStudents(data.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError(err.message);
            setStudents([]);
        }
    };

    const handleCourseSelect = (e) => {
        if (!e.target.value) return;

        console.log('Available courses:', courses); // Add this debug log
        console.log('Selected value:', e.target.value);

        const [courseId, secId, semester, year] = e.target.value.split('-');

        // Convert types before comparison
        const course = courses.find(c => {
            const match = (
                String(c.course_id) === String(courseId) &&
                String(c.sec_id) === String(secId) &&
                String(c.semester) === String(semester) &&
                String(c.year) === String(year)
            );

            console.log('Comparing:', {
                current: { courseId, secId, semester, year },
                withCourse: {
                    id: c.course_id,
                    sec: c.sec_id,
                    sem: c.semester,
                    yr: c.year
                },
                matches: match
            });

            return match;
        });

        if (!course) {
            console.error('Course not found:', e.target.value);
            return;
        }

        setSelectedCourse({
            course_id: course.course_id,
            course_name: course.course_name,
            sec_id: course.sec_id,
            semester: course.semester,
            year: course.year
        });
    };
    const handleGradeAction = (student) => {
        console.log('Student data for grade action:', student);
        setCurrentStudent({
            student_id: student.student_id,
            student_name: student.student_name,
            grade: student.grade,
            sec_id: selectedCourse.sec_id,
            semester: selectedCourse.semester,
            year: selectedCourse.year
        });
        setSelectedGrade(student.grade || "");
        setOpenGradeDialog(true);
    };

    const handleSaveGrade = async () => {
        try {
            if (!selectedGrade) {
                setError("Please select a grade");
                return;
            }

            const isUpdate = Boolean(currentStudent.grade);
            let response;

            if (isUpdate) {
                // Update existing grade
                const url = `http://localhost:3000/api/teachers/grades/${currentStudent.student_id}/${selectedCourse.course_id}/${selectedCourse.sec_id}/${selectedCourse.semester}/${selectedCourse.year}`;
                response = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ grade: selectedGrade })
                });
            } else {
                // Add new grade
                response = await fetch("http://localhost:3000/api/teachers/grades", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        studentId: currentStudent.student_id,
                        courseId: selectedCourse.course_id,
                        secId: selectedCourse.sec_id,
                        semester: selectedCourse.semester,
                        year: selectedCourse.year,
                        grade: selectedGrade
                    })
                });
            }

            const data = await response.json();
            console.log('Save grade response:', data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to save grade");
            }

            setSuccess(isUpdate ? "Grade updated successfully" : "Grade added successfully");
            setOpenGradeDialog(false);
            await fetchStudentGrades();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error saving grade:', err);
            setError(err.message || "Failed to save grade");
        }
    };

    const handleCloseDialog = () => {
        setOpenGradeDialog(false);
        setCurrentStudent(null);
        setSelectedGrade("");
        setError(null);
    };

    return (
        <Layout role="teacher">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">Grades Management</Typography>
                    <Divider sx={{ mb: 3 }} />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Course</InputLabel>
                        <Select
                            value={selectedCourse ? `${selectedCourse.course_id}-${selectedCourse.sec_id}-${selectedCourse.semester}-${selectedCourse.year}` : ""}
                            onChange={handleCourseSelect}
                            label="Select Course"
                        >
                            {courses.map((course) => {
                                const value = `${course.course_id}-${course.sec_id}-${course.semester}-${course.year}`;
                                return (
                                    <MenuItem key={value} value={value}>
                                        {`${course.course_name} (${course.semester} ${course.year}, Section ${course.sec_id})`}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    {loading ? (
                        <Box className="loading-container"><CircularProgress /></Box>
                    ) : selectedCourse && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Major</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Grade</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.student_id}>
                                            <TableCell>{student.student_id}</TableCell>
                                            <TableCell>{student.student_name}</TableCell>
                                            <TableCell>{student.major}</TableCell>
                                            <TableCell>{student.dept_name}</TableCell>
                                            <TableCell>{student.grade || 'Not graded'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleGradeAction(student)}
                                                >
                                                    {student.grade ? 'Edit Grade' : 'Add Grade'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <Dialog open={openGradeDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {currentStudent?.grade ? 'Edit Grade' : 'Add Grade'} for {currentStudent?.student_name}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Grade</InputLabel>
                        <Select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            label="Grade"
                        >
                            {gradeOptions.map(grade => (
                                <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveGrade} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default GradesManagementPage;