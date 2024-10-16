import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Paper, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { registerUser, login as loginService } from '../services/authService';
import axios from 'axios';

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (isLoginMode) {
                // Login logic
                const response = await loginService(email, password);
                const { token, authorities } = response;
                if (!token) throw new Error("Token not found");
                login(token, authorities);
                navigate('/dashboard');
            } else {
                // Registration logic
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await registerUser(email, password);
                setSuccessMessage('Registration successful! You can now log in.');
                setIsLoginMode(true); // Switch to login mode after successful registration
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(isLoginMode ? 'Invalid email or password' : 'Registration failed. Please try again.');
            } else {
                setError('Backend is currently unavailable. Please try again later.');
            }
            console.log(err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    {isLoginMode ? 'Login' : 'Register'}
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    {isLoginMode ? 'Please log in with your email' : 'Create an account using your email'}
                </Typography>
                {error && <Typography color="error" align="center">{error}</Typography>}
                {successMessage && <Typography color="primary" align="center">{successMessage}</Typography>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {!isLoginMode && (
                        <TextField
                            label="Confirm Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        {isLoginMode ? 'Log In' : 'Register'}
                    </Button>
                    <Box mt={2} textAlign="center">
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setIsLoginMode(!isLoginMode)}
                        >
                            {isLoginMode ? 'Don’t have an account? Register' : 'Already have an account? Log In'}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AuthPage;