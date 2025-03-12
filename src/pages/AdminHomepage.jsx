import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Typography, Card, CardContent, Box, CircularProgress, Divider } from "@mui/material";
import Layout from "../components/Layout";
import "../styles/common.css";

function AdminHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const response = await fetch("/api/admin/info", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch admin information");
                }

                const data = await response.json();
                setInfo(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchInfo();
    }, [user.token]);

    return (
        <Layout role="admin">
            {loading ? (
                <Box className="loading-container">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">Error: {error}</Typography>
            ) : (
                <Card className="page-card">
                    <CardContent>
                        <Typography variant="h4" className="page-title">
                            Welcome, {info.name}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box className="info-section">
                            <Typography variant="body1">Admin ID: {info.id}</Typography>
                            <Typography variant="body1">Role: System Administrator</Typography>
                            <Typography variant="body1">Email: {info.email}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Layout>
    );
}

export default AdminHomepage;