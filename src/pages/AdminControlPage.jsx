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
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [openCourseDialog, setOpenCourseDialog] = useState(false);
    const [openGradeDialog, setOpenGradeDialog] = useState(false);
    const [classrooms, setClassrooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [currentCourse, setCurrentCourse] = useState({
        course_id: "",
        course_name: "",
        dept_name: "",
        credits: ""
    });
    const [currentGrade, setCurrentGrade] = useState({
        student_id: "",
        course_id: "",
        sec_id: "",
        semester: "",
        year: "",
        grade: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState(null);
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({
        student_id: "",
        student_name: "",
        dept_name: "",
        major: "",
        year: "",
        tele: "",
        high_school: "",
        hometown: "",
        date_of_birth: "",
        email: ""
    });
    const [currentTeacher, setCurrentTeacher] = useState({
        teacher_id: "",
        teacher_name: "",
        dept_name: "",
        salary: "",
        tele: ""
    });
    const [sections, setSections] = useState([]);
    const [openSectionDialog, setOpenSectionDialog] = useState(false);
    const [currentSection, setCurrentSection] = useState({
        course_id: "",
        sec_id: "",
        semester: "",
        year: "",
        building: "",
        room_number: "",
        time_slot_id: ""
    });
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const showMessage = (type, message) => {
        if (type === 'success') {
            setSuccess(message);
            setError(null);
        } else {
            setError(message);
            setSuccess(null);
        }

        // Clear both messages after 5 seconds
        setTimeout(() => {
            if (type === 'success') {
                setSuccess(null);
            } else {
                setError(null);
            }
        }, 5000);
    };

    const [sectionFilters, setSectionFilters] = useState({
        course_id: "",
        sec_id: "",
        year: "",
        semester: ""
    });

    const [gradeFilters, setGradeFilters] = useState({
        student_id: ""
    });

    const handleSectionFilterChange = (e) => {
        setSectionFilters({
            ...sectionFilters,
            [e.target.name]: e.target.value
        });
    };

    const handleGradeFilterChange = (e) => {
        setGradeFilters({
            ...gradeFilters,
            [e.target.name]: e.target.value
        });
    };

    // Update getFilteredSections for more robust filtering
    const getFilteredSections = () => {
        return sections.filter(section => {
            // Ensure section exists and convert values to strings for comparison
            if (!section) return false;

            const courseId = section.course_id ? String(section.course_id) : "";
            const secId = section.sec_id ? String(section.sec_id) : "";
            const year = section.year !== undefined ? Number(section.year) : "";
            const semester = section.semester || "";

            return (sectionFilters.course_id === "" ||
                    courseId.toLowerCase().includes(sectionFilters.course_id.toLowerCase())) &&
                (sectionFilters.sec_id === "" ||
                    secId.toLowerCase().includes(sectionFilters.sec_id.toLowerCase())) &&
                (sectionFilters.year === "" || year === sectionFilters.year) &&
                (sectionFilters.semester === "" || semester === sectionFilters.semester);
        });
    };

// Similarly update getFilteredGrades
    const getFilteredGrades = () => {
        return grades.filter(grade => {
            if (!grade) return false;

            const studentId = grade.student_id ? String(grade.student_id) : "";

            return gradeFilters.student_id === "" ||
                studentId.toLowerCase().includes(gradeFilters.student_id.toLowerCase());
        });
    };
    // Fetch all data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch courses
                const coursesResponse = await fetch("http://localhost:3000/api/admin/courses", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!coursesResponse.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.data || []);

                // Fetch students
                const studentsResponse = await fetch("http://localhost:3000/api/admin/students", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!studentsResponse.ok) {
                    throw new Error("Failed to fetch students");
                }
                const studentsData = await studentsResponse.json();
                setStudents(studentsData.students || []);

                // Fetch grades
                const gradesResponse = await fetch("http://localhost:3000/api/admin/grades", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!gradesResponse.ok) {
                    throw new Error("Failed to fetch grades");
                }
                const gradesData = await gradesResponse.json();
                setGrades(gradesData.data || []);

                setLoading(false);
                // Fetch sections
                const sectionsResponse = await fetch("http://localhost:3000/api/admin/sections", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!sectionsResponse.ok) {
                    throw new Error("Failed to fetch sections");
                }
                const sectionsData = await sectionsResponse.json();
                setSections(sectionsData.data || []);
                // Add this to your existing fetchData function in useEffect
                const departmentsResponse = await fetch("http://localhost:3000/api/admin/departments", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!departmentsResponse.ok) {
                    throw new Error("Failed to fetch departments");
                }
                const departmentsData = await departmentsResponse.json();
                setDepartments(departmentsData.data || []);

                const classroomResponse = await fetch("http://localhost:3000/api/admin/classrooms", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!classroomResponse.ok) {
                    throw new Error("Failed to fetch classrooms");
                }
                const classroomData = await classroomResponse.json();
                setClassrooms(classroomData.data || []);

                const timeSlotsResponse = await fetch("http://localhost:3000/api/admin/time-slots", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!timeSlotsResponse.ok) {
                    throw new Error("Failed to fetch time slots");
                }
                const timeSlotsData = await timeSlotsResponse.json();
                setTimeSlots(timeSlotsData.data || []);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    useEffect(() => {
        if (currentSection.building) {
            const filteredRooms = classrooms
                .filter(room => room.building === currentSection.building)
                .map(room => room.room_number);
            setAvailableRooms(filteredRooms);

            // Reset room selection if current room is not in the filtered list
            if (currentSection.room_number && !filteredRooms.includes(currentSection.room_number)) {
                setCurrentSection({
                    ...currentSection,
                    room_number: ""
                });
            }
        } else {
            setAvailableRooms([]);
        }
    }, [currentSection.building, classrooms]);

    const getNextUserId = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/users/max-id", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch max user ID");
            }

            const data = await response.json();
            console.log(data.data);
            return data.data.max_id + 1; // Increment by 1 to get next available ID
        } catch (err) {
            setError(err.message);
            return 10000; // Fallback if API fails
        }
    };

    // Course functions
    const handleOpenCourseDialog = (course = null) => {
        if (course) {
            setCurrentCourse(course);
            setIsEditing(true);
        } else {
            setCurrentCourse({
                course_id: "",
                course_name: "",
                dept_name: "",
                credits: ""
            });
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
            const url = isEditing ? `http://localhost:3000/api/admin/courses/${currentCourse.course_id}` : "http://localhost:3000/api/admin/courses";

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
            const coursesResponse = await fetch("http://localhost:3000/api/admin/courses", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!coursesResponse.ok) {
                throw new Error("Failed to refresh courses");
            }

            const coursesData = await coursesResponse.json();
            setCourses(coursesData.data || []);
            setSuccess(`Course ${isEditing ? "updated" : "created"} successfully`);

            setTimeout(() => setSuccess(null), 3000);
            setOpenCourseDialog(false);
        } catch (err) {
            showMessage('error',err.message);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/courses/${courseId}`, {
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
                showMessage('error',err.message);
            }
        }
    };

    // Grade functions
    const handleOpenGradeDialog = (grade = null) => {
        if (grade) {
            setCurrentGrade(grade);
            setIsEditing(true);
        } else {
            setCurrentGrade({
                student_id: "",
                course_id: "",
                sec_id: "",
                semester: "",
                year: "",
                grade: ""
            });
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
            const url = isEditing ? `http://localhost:3000/api/admin/grades/${currentGrade.id}` : "http://localhost:3000/api/admin/grades";

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
            const gradesResponse = await fetch("http://localhost:3000/api/admin/grades", {
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
            showMessage('error',err.message);
        }
    };

    const handleDeleteGrade = async (gradeId) => {
        if (window.confirm("Are you sure you want to delete this grade record?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/grades/${gradeId}`, {
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

    // Student registration handlers
    const handleOpenStudentDialog = async () => {
        try {
            const nextUserId = await getNextUserId();
            setCurrentStudent({
                student_id: "",
                student_name: "",
                dept_name: "",
                major: "",
                year: "",
                tele: "",
                high_school: "",
                hometown: "",
                date_of_birth: "",
                email: "",
                user_id: nextUserId,
                user_name: "",
                password: "123456"
            });
            setOpenStudentDialog(true);
        } catch (err) {
            setError("Failed to prepare student registration: " + err.message);
        }
    };

    const handleCloseStudentDialog = () => {
        setOpenStudentDialog(false);
    };

    // Update handleStudentChange to generate username
    const handleStudentChange = (e) => {
        const updatedStudent = {
            ...currentStudent,
            [e.target.name]: e.target.value
        };

        // Auto-generate username when name or id changes
        if (e.target.name === 'student_name' || e.target.name === 'student_id') {
            if (updatedStudent.student_name && updatedStudent.student_id) {
                // Create username from name and id (removing spaces from name)
                const formattedName = updatedStudent.student_name.replace(/\s+/g, '');
                updatedStudent.user_name = `${formattedName}_${updatedStudent.student_id}`;
            }
        }

        setCurrentStudent(updatedStudent);
    };

    const handleSaveStudent = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/register/student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentStudent)
            });

            if (!response.ok) {
                throw new Error("Failed to register student");
            }

            setSuccess("Student registered successfully");
            setTimeout(() => setSuccess(null), 3000);
            setOpenStudentDialog(false);
        } catch (err) {
            showMessage('error',err.message);
        }
    };

// Teacher registration handlers
    const handleOpenTeacherDialog = async () => {
        try {
            const nextUserId = await getNextUserId();
            setCurrentTeacher({
                teacher_id: "",
                teacher_name: "",
                dept_name: "",
                salary: "",
                tele: "",
                user_id: nextUserId,
                user_name: "",
                password: "123456"
            });
            setOpenTeacherDialog(true);
        } catch (err) {
            showMessage('error',"Failed to prepare teacher registration" + err.message);
        }
    };

    const handleCloseTeacherDialog = () => {
        setOpenTeacherDialog(false);
    };

    // Update handleTeacherChange to generate username
    const handleTeacherChange = (e) => {
        const updatedTeacher = {
            ...currentTeacher,
            [e.target.name]: e.target.value
        };

        // Auto-generate username when name or id changes
        if (e.target.name === 'teacher_name' || e.target.name === 'teacher_id') {
            if (updatedTeacher.teacher_name && updatedTeacher.teacher_id) {
                // Create username from name and id (removing spaces from name)
                const formattedName = updatedTeacher.teacher_name.replace(/\s+/g, '');
                updatedTeacher.user_name = `${formattedName}_${updatedTeacher.teacher_id}`;
            }
        }

        setCurrentTeacher(updatedTeacher);
    };

    const handleSaveTeacher = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/register/teacher", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentTeacher)
            });

            if (!response.ok) {
                throw new Error("Failed to register teacher");
            }

            setSuccess("Teacher registered successfully");
            setTimeout(() => setSuccess(null), 3000);
            setOpenTeacherDialog(false);
        } catch (err) {
            showMessage('error',err.message);
        }
    };

    // Section handlers
    const handleOpenSectionDialog = (section = null) => {
        if (section) {
            setCurrentSection(section);
            setIsEditing(true);
        } else {
            setCurrentSection({
                course_id: "",
                sec_id: "",
                semester: "",
                year: "",
                building: "",
                room_number: "",
                time_slot_id: ""
            });
            setIsEditing(false);
        }
        setOpenSectionDialog(true);
    };

    const handleCloseSectionDialog = () => {
        setOpenSectionDialog(false);
    };

    const handleSectionChange = (e) => {
        setCurrentSection({
            ...currentSection,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveSection = async () => {
        // Validate required primary key fields
        if (!currentSection.course_id || !currentSection.sec_id ||
            !currentSection.semester || !currentSection.year) {
            showMessage('error',"Course ID, Section ID, Semester, and Year are required fields");
            return;
        }

        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `http://localhost:3000/api/admin/sections/${currentSection.course_id}/${currentSection.sec_id}`
                : "http://localhost:3000/api/admin/sections";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(currentSection)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? "update" : "create"} section`);
            }

            // Refresh sections
            const sectionsResponse = await fetch("http://localhost:3000/api/admin/sections", {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!sectionsResponse.ok) {
                throw new Error("Failed to refresh sections");
            }

            const sectionsData = await sectionsResponse.json();
            // Fix: Use the correct property name (data, not sections)
            setSections(sectionsData.data || []);
            setSuccess(`Section ${isEditing ? "updated" : "created"} successfully`);

            setTimeout(() => setSuccess(null), 3000);
            setOpenSectionDialog(false);
        } catch (err) {
            showMessage('error',err.message);
        }
    };

    const handleDeleteSection = async (courseId, secId, year, semester) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/sections/${courseId}/${secId}/${year}/${semester}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete section");
                }

                // Update sections state with all four primary key fields
                setSections(sections.filter(section =>
                    !(section.course_id === courseId &&
                        section.sec_id === secId &&
                        section.year == year &&
                        section.semester === semester)
                ));

                setSuccess("Section deleted successfully");
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                showMessage('error',err.message);
            }
        }
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
                            <Tab label="Section Management" />
                            <Tab label="Grades Management" />
                            <Tab label="User Management" />
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
                                                    <TableCell>Course ID</TableCell>
                                                    <TableCell>Course Name</TableCell>
                                                    <TableCell>Department</TableCell>
                                                    <TableCell>Credits</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {courses.map((course) => (
                                                    <TableRow key={course.course_id} hover>
                                                        <TableCell>{course.course_id}</TableCell>
                                                        <TableCell>{course.course_name}</TableCell>
                                                        <TableCell>{course.dept_name}</TableCell>
                                                        <TableCell>{course.credits}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleOpenCourseDialog(course)} size="small">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDeleteCourse(course.course_id)} size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                            {tabValue === 1 && (

                                <Box>
                                    {/* Add this section filter box here */}
                                    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f8f8f8", borderRadius: 1 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Filter Sections</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <TextField
                                                name="course_id"
                                                label="Course ID"
                                                variant="outlined"
                                                size="small"
                                                value={sectionFilters.course_id}
                                                onChange={handleSectionFilterChange}
                                                sx={{ width: 150 }}
                                            />
                                            <TextField
                                                name="sec_id"
                                                label="Section ID"
                                                variant="outlined"
                                                size="small"
                                                value={sectionFilters.sec_id}
                                                onChange={handleSectionFilterChange}
                                                sx={{ width: 150 }}
                                            />
                                            <FormControl sx={{ width: 150 }} size="small">
                                                <InputLabel>Semester</InputLabel>
                                                <Select
                                                    name="semester"
                                                    value={sectionFilters.semester}
                                                    onChange={handleSectionFilterChange}
                                                    label="Semester"
                                                >
                                                    <MenuItem value="">All</MenuItem>
                                                    <MenuItem value="Spring">Spring</MenuItem>
                                                    <MenuItem value="Summer">Summer</MenuItem>
                                                    <MenuItem value="Fall">Fall</MenuItem>
                                                    <MenuItem value="Winter">Winter</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl sx={{ width: 150 }} size="small">
                                                <InputLabel>Year</InputLabel>
                                                <Select
                                                    name="year"
                                                    value={sectionFilters.year}
                                                    onChange={handleSectionFilterChange}
                                                    label="Year"
                                                >
                                                    <MenuItem value="">All</MenuItem>
                                                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSectionFilters({course_id: "", sec_id: "", year: "", semester: ""})}
                                            >
                                                Clear Filters
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Section Management</Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => handleOpenSectionDialog()}
                                        >
                                            Add Section
                                        </Button>
                                    </Box>
                                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                        <Table>
                                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                <TableRow>
                                                    <TableCell>Course ID</TableCell>
                                                    <TableCell>Course Name</TableCell>
                                                    <TableCell>Section ID</TableCell>
                                                    <TableCell>Semester</TableCell>
                                                    <TableCell>Year</TableCell>
                                                    <TableCell>Building</TableCell>
                                                    <TableCell>Room</TableCell>
                                                    <TableCell>Time Slot</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {getFilteredSections().map((section) => (
                                                    <TableRow key={`${section.course_id}-${section.sec_id}`} hover>
                                                        <TableCell>{section.course_id}</TableCell>
                                                        <TableCell>
                                                            {courses.find(c => c.course_id === section.course_id)?.course_name || "Unknown"}
                                                        </TableCell>
                                                        <TableCell>{section.sec_id}</TableCell>
                                                        <TableCell>{section.semester}</TableCell>
                                                        <TableCell>{section.year}</TableCell>
                                                        <TableCell>{section.building}</TableCell>
                                                        <TableCell>{section.room_number}</TableCell>
                                                        <TableCell>{section.time_slot_id}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleOpenSectionDialog(section)} size="small">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => handleDeleteSection(
                                                                    section.course_id,
                                                                    section.sec_id,
                                                                    section.year,
                                                                    section.semester
                                                                )}
                                                                size="small"
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                </Box>

                            )}
                            {tabValue === 2 && (
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
                                    {/* Add this grade filter box here */}
                                    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f8f8f8", borderRadius: 1 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Filter Grades</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <TextField
                                                name="student_id"
                                                label="Student ID"
                                                variant="outlined"
                                                size="small"
                                                value={gradeFilters.student_id}
                                                onChange={handleGradeFilterChange}
                                                sx={{ width: 200 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setGradeFilters({student_id: ""})}
                                            >
                                                Clear Filter
                                            </Button>
                                        </Box>
                                    </Box>
                                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                        <Table>
                                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                <TableRow>
                                                    <TableCell>Student ID</TableCell>
                                                    <TableCell>Course ID</TableCell>
                                                    <TableCell>Section ID</TableCell>
                                                    <TableCell>Semester</TableCell>
                                                    <TableCell>Year</TableCell>
                                                    <TableCell>Grade</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {getFilteredGrades().map((grade) => (
                                                    <TableRow key={`${grade.student_id}-${grade.course_id}-${grade.sec_id}`} hover>
                                                        <TableCell>{grade.student_id}</TableCell>
                                                        <TableCell>{grade.course_id}</TableCell>
                                                        <TableCell>{grade.sec_id}</TableCell>
                                                        <TableCell>{grade.semester}</TableCell>
                                                        <TableCell>{grade.year}</TableCell>
                                                        <TableCell>{grade.grade}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleOpenGradeDialog(grade)} size="small">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDeleteGrade(`${grade.student_id}-${grade.course_id}-${grade.sec_id}`)} size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {tabValue === 3 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 3 }}>User Management</Typography>

                                    {/* Student Registration Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">Student Registration</Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={handleOpenStudentDialog}
                                            >
                                                Register Student
                                            </Button>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Register new students with their basic information. Student ID and personal details are required.
                                        </Typography>
                                    </Box>

                                    {/* Teacher Registration Section */}
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">Teacher Registration</Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={handleOpenTeacherDialog}
                                            >
                                                Register Teacher
                                            </Button>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Register new teachers with their department, salary information and contact details.
                                        </Typography>
                                    </Box>
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
                        name="course_id"
                        label="Course ID"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.course_id}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="course_name"
                        label="Course Name"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.course_name}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="dept_name"
                        label="Department"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.dept_name}
                        onChange={handleCourseChange}
                    />
                    <TextField
                        margin="dense"
                        name="credits"
                        label="Credits"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentCourse.credits}
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
                            name="student_id"
                            value={currentGrade.student_id}
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
                            name="course_id"
                            value={currentGrade.course_id}
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
                        name="sec_id"
                        label="Section ID"
                        fullWidth
                        variant="outlined"
                        value={currentGrade.sec_id}
                        onChange={handleGradeChange}
                    />

                    <TextField
                        margin="dense"
                        name="semester"
                        label="Semester"
                        fullWidth
                        variant="outlined"
                        value={currentGrade.semester}
                        onChange={handleGradeChange}
                    />

                    <TextField
                        margin="dense"
                        name="year"
                        label="Year"
                        fullWidth
                        variant="outlined"
                        value={currentGrade.year}
                        onChange={handleGradeChange}
                    />

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
            {/* Student Registration Dialog */}
            <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog} maxWidth="md" fullWidth>
                <DialogTitle>Register New Student</DialogTitle>
                <DialogContent>
                    <Typography variant="caption" color="text.secondary">
                        Required fields are marked with *
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <TextField
                                margin="dense"
                                name="user_id"
                                label="User ID (Auto-generated)"
                                sx={{ width: '48%' }}
                                value={currentStudent.user_id}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                margin="dense"
                                name="user_name"
                                label="Username (Auto-generated)"
                                fullWidth
                                value={currentStudent.user_name || ''}
                                InputProps={{
                                    readOnly: true,
                                }}
                                helperText="Username will be used for login"
                            />
                            <TextField
                                margin="dense"
                                name="password"
                                label="Default Password"
                                sx={{ width: '48%' }}
                                value={currentStudent.password}
                                InputProps={{
                                    readOnly: true,
                                }}
                                helperText="Default password for first login"
                            />
                        </Box>
                        <TextField
                            required
                            margin="dense"
                            name="student_id"
                            label="Student ID"
                            sx={{ width: '48%' }}
                            value={currentStudent.student_id}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            required
                            margin="dense"
                            name="student_name"
                            label="Student Name"
                            sx={{ width: '48%' }}
                            value={currentStudent.student_name}
                            onChange={handleStudentChange}
                        />
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Department</InputLabel>
                            <Select
                                name="dept_name"
                                value={currentStudent.dept_name}
                                onChange={handleStudentChange}
                                label="Department"
                            >
                                {departments.map(dept => (
                                    <MenuItem key={dept.dept_name} value={dept.dept_name}>
                                        {dept.dept_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            required
                            margin="dense"
                            name="major"
                            label="Major"
                            sx={{ width: '48%' }}
                            value={currentStudent.major}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            required
                            margin="dense"
                            name="year"
                            label="Year"
                            sx={{ width: '48%' }}
                            value={currentStudent.year}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            required
                            margin="dense"
                            name="tele"
                            label="Telephone"
                            sx={{ width: '48%' }}
                            value={currentStudent.tele}
                            onChange={handleStudentChange}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Additional Information (Optional)
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                            margin="dense"
                            name="high_school"
                            label="High School"
                            sx={{ width: '48%' }}
                            value={currentStudent.high_school}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            margin="dense"
                            name="hometown"
                            label="Hometown"
                            sx={{ width: '48%' }}
                            value={currentStudent.hometown}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            margin="dense"
                            name="date_of_birth"
                            label="Date of Birth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: '48%' }}
                            value={currentStudent.date_of_birth}
                            onChange={handleStudentChange}
                        />

                        <TextField
                            margin="dense"
                            name="email"
                            label="Email"
                            type="email"
                            sx={{ width: '48%' }}
                            value={currentStudent.email}
                            onChange={handleStudentChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStudentDialog}>Cancel</Button>
                    <Button onClick={handleSaveStudent} variant="contained">Register</Button>
                </DialogActions>
            </Dialog>

            {/* Teacher Registration Dialog */}
            <Dialog open={openTeacherDialog} onClose={handleCloseTeacherDialog}>
                <DialogTitle>Register New Teacher</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="user_id"
                        label="User ID (Auto-generated)"
                        fullWidth
                        value={currentTeacher.user_id}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        name="user_name"
                        label="Username (Auto-generated)"
                        fullWidth
                        value={currentTeacher.user_name || ''}
                        InputProps={{
                            readOnly: true,
                        }}
                        helperText="Username will be used for login"
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="Default Password"
                        fullWidth
                        value={currentTeacher.password}
                        InputProps={{
                            readOnly: true,
                        }}
                        helperText="Default password for first login"
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        name="teacher_id"
                        label="Teacher ID"
                        fullWidth
                        value={currentTeacher.teacher_id}
                        onChange={handleTeacherChange}
                    />

                    <TextField
                        required
                        margin="dense"
                        name="teacher_name"
                        label="Teacher Name"
                        fullWidth
                        value={currentTeacher.teacher_name}
                        onChange={handleTeacherChange}
                    />

                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Department</InputLabel>
                        <Select
                            name="dept_name"
                            value={currentTeacher.dept_name}
                            onChange={handleTeacherChange}
                            label="Department"
                        >
                            {departments.map(dept => (
                                <MenuItem key={dept.dept_name} value={dept.dept_name}>
                                    {dept.dept_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        required
                        margin="dense"
                        name="salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        value={currentTeacher.salary}
                        onChange={handleTeacherChange}
                    />

                    <TextField
                        required
                        margin="dense"
                        name="tele"
                        label="Telephone"
                        fullWidth
                        value={currentTeacher.tele}
                        onChange={handleTeacherChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTeacherDialog}>Cancel</Button>
                    <Button onClick={handleSaveTeacher} variant="contained">Register</Button>
                </DialogActions>
            </Dialog>
            {/* Section Dialog */}
            <Dialog open={openSectionDialog} onClose={handleCloseSectionDialog} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? "Edit Section" : "Add New Section"}</DialogTitle>
                <DialogContent>
                    {/* Course selection - required */}
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Course</InputLabel>
                        <Select
                            name="course_id"
                            value={currentSection.course_id}
                            onChange={handleSectionChange}
                            label="Course"
                        >
                            {courses.map(course => (
                                <MenuItem key={course.course_id} value={course.course_id}>
                                    {course.course_name} ({course.course_id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Section ID - required */}
                    <TextField
                        margin="dense"
                        name="sec_id"
                        label="Section ID"
                        fullWidth
                        variant="outlined"
                        value={currentSection.sec_id}
                        onChange={handleSectionChange}
                        required
                    />

                    {/* Semester - required */}
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            name="semester"
                            value={currentSection.semester}
                            onChange={handleSectionChange}
                            label="Semester"
                        >
                            <MenuItem value="Spring">Spring</MenuItem>
                            <MenuItem value="Summer">Summer</MenuItem>
                            <MenuItem value="Fall">Fall</MenuItem>
                            <MenuItem value="Winter">Winter</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Year - required */}
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Year</InputLabel>
                        <Select
                            name="year"
                            value={currentSection.year}
                            onChange={handleSectionChange}
                            label="Year"
                        >
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Replace the existing building TextField with this */}
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Building</InputLabel>
                        <Select
                            name="building"
                            value={currentSection.building || ""}
                            onChange={handleSectionChange}
                            label="Building"
                        >
                            {[...new Set(classrooms.map(room => room.building))].map(building => (
                                <MenuItem key={building} value={building}>
                                    {building}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Replace the existing room_number TextField with this */}
                    <FormControl fullWidth margin="dense" disabled={!currentSection.building}>
                        <InputLabel>Room Number</InputLabel>
                        <Select
                            name="room_number"
                            value={currentSection.room_number || ""}
                            onChange={handleSectionChange}
                            label="Room Number"
                        >
                            {availableRooms.map(room => (
                                <MenuItem key={room} value={room}>
                                    {room}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Replace the existing time_slot_id TextField with this */}
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Time Slot</InputLabel>
                        <Select
                            name="time_slot_id"
                            value={currentSection.time_slot_id || ""}
                            onChange={handleSectionChange}
                            label="Time Slot"
                        >
                            {timeSlots.map(slot => (
                                <MenuItem key={slot.time_slot_id} value={slot.time_slot_id}>
                                    ID: {slot.time_slot_id} - {slot.day} {slot.start_time}-{slot.end_time}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSectionDialog}>Cancel</Button>
                    <Button onClick={handleSaveSection} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminControlPage;