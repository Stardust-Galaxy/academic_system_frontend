import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Grid, TextField, RadioGroup, FormControlLabel, Radio,
    Button, Typography, Box, Container, Alert, Dialog,
    DialogTitle, DialogContent, DialogActions, Stepper,
    Step, StepLabel, Link
} from "@mui/material";

function LoginPage() {
    const [user_type, setUser_type] = useState("student");
    const [user_name, setUser_name] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    // Password reset states
    const [resetOpen, setResetOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [resetUsername, setResetUsername] = useState("");
    const [resetUserType, setResetUserType] = useState("student");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [verificationSuccess, setVerificationSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user_name || !password) {
            setError("Please fill in all fields");
            return;
        }
        try {
            const response = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_name, password, user_type }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            login(data.token, user_type);
            navigate(`/${user_type}`);
        } catch (err) {
            setError("An error occurred");
            console.error(err);
        }
    };

    const handleResetOpen = () => {
        setResetOpen(true);
        setActiveStep(0);
        setResetUsername("");
        setResetUserType("student");
        setNewPassword("");
        setConfirmPassword("");
        setResetError("");
        setResetSuccess(false);
    };

    const handleResetClose = () => {
        setResetOpen(false);
    };

    // First, fix activeStep logic in handleNext
    const handleNext = async () => {
        if (activeStep === 0) {
            if (!resetUsername) {
                setResetError("Please enter your username");
                return;
            }
            setResetError("");
        }
        else if (activeStep === 1) {
            if (!currentPassword) {
                setResetError("Please enter your current password");
                return;
            }

            // Verify current password with backend
            try {
                const response = await fetch("http://localhost:3000/api/users/verify-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_name: resetUsername,
                        user_type: resetUserType,
                        password: currentPassword
                    }),
                });

                if (!response.ok) {
                    setResetError("Current password is incorrect");
                    return;
                }

                setResetError("");
            } catch (err) {
                console.error(err);
                setResetError("Failed to verify password");
                return;
            }
        }
        else if (activeStep === 2) {
            if (newPassword !== confirmPassword) {
                setResetError("Passwords don't match");
                return;
            }
            if (newPassword.length < 6) {
                setResetError("Password must be at least 6 characters");
                return;
            }

            // Submit password reset at step 2
            await handleResetSubmit();
            // Don't return here so we can advance to completion step
        }

        // Advance to next step
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleResetSubmit = async () => {
        try {
            // API call to reset password
            const response = await fetch("http://localhost:3000/api/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_name: resetUsername,
                    user_type: resetUserType,
                    new_password: newPassword
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setResetSuccess(true);
        } catch (err) {
            setResetError(err.message || "An error occurred while resetting password");
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
                            value={user_type}
                            onChange={(e) => setUser_type(e.target.value)}
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
                            value={user_name}
                            onChange={(e) => setUser_name(e.target.value)}
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

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={handleResetOpen}
                            >
                                Forgot Password? Reset here
                            </Link>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Password Reset Dialog */}
            <Dialog open={resetOpen} onClose={handleResetClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    Reset Password
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
                        <Step>
                            <StepLabel>Identify</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Verify</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>New Password</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Complete</StepLabel>
                        </Step>
                    </Stepper>

                    {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}

                    {activeStep === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Please enter your username and select your user type
                            </Typography>

                            <TextField
                                fullWidth
                                required
                                label="Username"
                                value={resetUsername}
                                onChange={(e) => setResetUsername(e.target.value)}
                                margin="normal"
                            />

                            <RadioGroup
                                row
                                value={resetUserType}
                                onChange={(e) => setResetUserType(e.target.value)}
                                sx={{ mt: 1 }}
                            >
                                <FormControlLabel value="student" control={<Radio />} label="Student" />
                                <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                            </RadioGroup>
                        </Box>
                    )}
                    {activeStep === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Please enter your current password to verify your identity
                            </Typography>

                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                margin="normal"
                            />
                        </Box>
                    )}
                    {activeStep === 2 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Enter and confirm your new password
                            </Typography>

                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                margin="normal"
                            />
                        </Box>
                    )}

                    {activeStep === 3 && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            {resetSuccess ? (
                                <>
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Password reset successful!
                                    </Alert>
                                    <Typography variant="body1">
                                        You can now login with your new password.
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body1">
                                    Processing your request...
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResetClose}>
                        {activeStep === 3 ? "Close" : "Cancel"}
                    </Button>
                    {activeStep > 0 && activeStep < 3 && (
                        <Button onClick={handleBack}>
                            Back
                        </Button>
                    )}
                    {activeStep < 3 && (
                        <Button onClick={handleNext}>
                            {activeStep === 2 ? "Reset Password" : "Next"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default LoginPage;