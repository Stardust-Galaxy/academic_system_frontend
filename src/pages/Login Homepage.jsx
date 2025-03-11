import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, Button, Typography } from "@mui/material";

function LoginPage() {
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
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            });
            if (response.ok) {
                const data = await response.json();
                login(data.token, role);
                navigate(`/${role}`);
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    return (
        <Grid container spacing={2} style={{ height: "100vh" }}>
            <Grid item xs={6}>
                <Typography variant="h2">Welcome to the Academic System</Typography>
                <Typography>Manage your academic journey with ease.</Typography>
            </Grid>
            <Grid item xs={6} container alignItems="center" justifyContent="center">
                <form onSubmit={handleSubmit}>
                    <Typography variant="h5">Login</Typography>
                    <RadioGroup value={role} onChange={(e) => setRole(e.target.value)}>
                        <FormControlLabel value="student" control={<Radio />} label="Student" />
                        <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                        <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                    </RadioGroup>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                    {error && <Typography color="error">{error}</Typography>}
                </form>
            </Grid>
        </Grid>
    );
}

export default LoginPage;