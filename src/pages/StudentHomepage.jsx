import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Typography, Card, CardContent } from "@mui/material";
import Layout from "../components/Layout";

function StudentHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            const response = await fetch("/api/student/info", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            setInfo(data);
        };
        fetchInfo();
    }, [user.token]);

    if (!info) return <div>Loading...</div>;

    return (
        <Layout role="student">
            <Card>
                <CardContent>
                    <Typography variant="h4">Welcome, {info.name}</Typography>
                    <Typography>Student ID: {info.id}</Typography>
                    <Typography>Major: {info.major}</Typography>
                </CardContent>
            </Card>
        </Layout>
    );
}

export default StudentHomepage;