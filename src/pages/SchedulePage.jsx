import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider
} from "@mui/material";
import Layout from "../components/Layout";
import "../styles/common.css";

function SchedulePage() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/students/schedule", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch schedule: ${response.status}`);
                }

                // Check response content type
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Non-JSON response:", text);
                    throw new Error("Server returned non-JSON response");
                }

                try {
                    const data = await response.json();
                    console.log(data.data);
                    setSchedule(data.data || []);
                    setLoading(false);
                } catch (parseError) {
                    console.error("JSON parsing error:", parseError);
                    throw new Error("Failed to parse response as JSON");
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user.token]);

    // Group schedule by days of week
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const scheduleByDay = weekdays.map(day => {
        return {
            day,
            courses: schedule.filter(course => course.day === day)
        };
    });

    return (
        <Layout role="student">
            <Card className="page-card">
                <CardContent>
                    <Typography variant="h4" className="page-title">My Class Schedule</Typography>
                    <Divider sx={{ mb: 3 }} />

                    {loading ? (
                        <Box className="loading-container">
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">Error: {error}</Typography>
                    ) : (
                        <>
                            {scheduleByDay.map(daySchedule => (
                                daySchedule.courses.length > 0 && (
                                    <Box key={daySchedule.day} mb={4}>
                                        <Typography variant="h6" gutterBottom>{daySchedule.day}</Typography>
                                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                            <Table>
                                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                                    <TableRow>
                                                        <TableCell>Course</TableCell>
                                                        <TableCell>Time</TableCell>
                                                        <TableCell>Location</TableCell>
                                                        <TableCell>Teacher</TableCell>
                                                        <TableCell>Credits</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {daySchedule.courses.map((course) => (
                                                        <TableRow key={course.course_id} hover>
                                                            <TableCell>{course.course_name}</TableCell>
                                                            <TableCell>{`${course.start_time} - ${course.end_time}`}</TableCell>
                                                            <TableCell>{course.building}</TableCell>
                                                            <TableCell>{course.teacher_name}</TableCell>
                                                            <TableCell>{course.credits}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )
                            ))}

                            {schedule.length === 0 && (
                                <Box className="info-section">
                                    <Typography variant="body1">No courses in your schedule yet.</Typography>
                                </Box>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}

export default SchedulePage;