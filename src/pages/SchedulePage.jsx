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
                const response = await fetch("/api/student/schedule", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch schedule");
                }

                const data = await response.json();
                setSchedule(data.courses || []);
                setLoading(false);
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
                                                        <TableCell>Instructor</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {daySchedule.courses.map((course) => (
                                                        <TableRow key={course.id} hover>
                                                            <TableCell>{course.name}</TableCell>
                                                            <TableCell>{`${course.startTime} - ${course.endTime}`}</TableCell>
                                                            <TableCell>{course.location}</TableCell>
                                                            <TableCell>{course.instructor}</TableCell>
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