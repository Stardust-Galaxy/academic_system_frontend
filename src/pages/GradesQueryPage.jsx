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
    Paper,
    Alert,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Layout from "../components/Layout";
import "../styles/common.css";

function GradesQueryPage() {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [statistics, setStatistics] = useState({ gpa: 0, totalCredits: 0, completedCourses: 0 });

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setLoading(true);

                const response = await fetch("/api/student/grades", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch grades");
                }

                const data = await response.json();
                setGrades(data.grades || []);

                // Calculate statistics
                if (data.grades && data.grades.length > 0) {
                    const completedCourses = data.grades.length;
                    const totalCredits = data.grades.reduce((sum, grade) => sum + (grade.credits || 0), 0);

                    // Calculate GPA (assuming grades are on a 4.0 scale)
                    const gradePoints = data.grades.reduce((sum, grade) => {
                        const credits = grade.credits || 0;
                        const gradeValue = getGradeValue(grade.grade);
                        return sum + (gradeValue * credits);
                    }, 0);

                    const gpa = totalCredits > 0 ? gradePoints / totalCredits : 0;

                    setStatistics({
                        gpa,
                        totalCredits,
                        completedCourses
                    });
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user.token]);

    // Helper function to convert letter grade to numeric value
    const getGradeValue = (grade) => {
        const gradeMap = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0
        };

        return gradeMap[grade] || 0;
    };

    // Get unique semesters for the filter
    const semesters = ['all', ...new Set(grades.map(grade => grade.semester))];

    // Filter grades based on search term and semester
    const filteredGrades = grades.filter(grade => {
        const matchesSearch = grade.courseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSemester = semesterFilter === 'all' || grade.semester === semesterFilter;
        return matchesSearch && matchesSemester;
    });

    // Helper function to set grade color based on value
    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return '#4caf50'; // Green
        if (grade.startsWith('B')) return '#2196f3'; // Blue
        if (grade.startsWith('C')) return '#ff9800'; // Orange
        if (grade.startsWith('D')) return '#ff5722'; // Deep Orange
        if (grade === 'F') return '#f44336'; // Red
        return '#757575'; // Grey (default)
    };

    return (
        <Layout role="student">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">
                        My Academic Record
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {error && <Alert severity="error" sx={{ mb: 2 }}>Error: {error}</Alert>}

                    {loading ? (
                        <Box className="loading-container">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Grid container spacing={3} className="dashboard-grid">
                                    <Grid item xs={12} md={4}>
                                        <Card className="info-section">
                                            <CardContent>
                                                <Typography variant="h6">GPA</Typography>
                                                <Typography variant="h4">{statistics.gpa.toFixed(2)}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card className="info-section">
                                            <CardContent>
                                                <Typography variant="h6">Total Credits</Typography>
                                                <Typography variant="h4">{statistics.totalCredits}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card className="info-section">
                                            <CardContent>
                                                <Typography variant="h6">Courses Completed</Typography>
                                                <Typography variant="h4">{statistics.completedCourses}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5">Grade Report</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Semester</InputLabel>
                                        <Select
                                            value={semesterFilter}
                                            onChange={(e) => setSemesterFilter(e.target.value)}
                                            label="Semester"
                                        >
                                            {semesters.map(semester => (
                                                <MenuItem key={semester} value={semester}>
                                                    {semester === 'all' ? 'All Semesters' : semester}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

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
                            </Box>

                            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell>Course Code</TableCell>
                                            <TableCell>Course Name</TableCell>
                                            <TableCell>Credits</TableCell>
                                            <TableCell>Grade</TableCell>
                                            <TableCell>Semester</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredGrades.length > 0 ? (
                                            filteredGrades.map((grade) => (
                                                <TableRow key={grade.id} hover>
                                                    <TableCell>{grade.courseCode}</TableCell>
                                                    <TableCell>{grade.courseName}</TableCell>
                                                    <TableCell>{grade.credits}</TableCell>
                                                    <TableCell>
                                                        <Box
                                                            sx={{
                                                                display: 'inline-block',
                                                                bgcolor: getGradeColor(grade.grade),
                                                                color: 'white',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 1
                                                            }}
                                                        >
                                                            {grade.grade}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{grade.semester}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No grades found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}

export default GradesQueryPage;