import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Grid, TextField, RadioGroup, FormControlLabel, Radio,
    Button, Typography, Box, Paper, Container, Alert
} from "@mui/material";

function LoginPage() {
    console.log("LoginPage");
    const [role, setRole] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }
        try {
            console.log("Logging in with:", { username, password, role });
            const mockToken = 'mock-jwt-token-' + role;
            login(mockToken, role);
            navigate(`/${role}`);
        } catch (err) {
            setError("An error occurred");
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Grid container spacing={2} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                {/* Left side - Welcome */}
                <Grid item xs={12} md={6} sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to the Academic System
                    </Typography>
                    <Typography variant="body1">
                        Manage your academic journey with ease.
                    </Typography>
                </Grid>

                {/* Right side - Login form */}
                <Grid item xs={12} md={6} sx={{ p: 4, bgcolor: 'background.paper' }}>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Login
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <RadioGroup
                            row
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            sx={{ mb: 2 }}
                        >
                            <FormControlLabel value="student" control={<Radio />} label="Student" />
                            <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                        </RadioGroup>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Login
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default LoginPage;