import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Login icon

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
        console.log('LoginPage: Attempting login with', { username, password }); // For debugging
        const response = await apiClient.post('/auth/login', { username, password }); // apiClient should be used
        console.log('LoginPage: Login response:', response); // For debugging
        // Check if the response contains a token and user data
        if (response.data.token && response.data.user) {
            localStorage.setItem('authToken', response.data.token); // Storing token
            console.log('LoginPage: Token stored:', response.data.token); // For debugging
            auth.loginSuccess(response.data.user, response.data.token); // Update AuthContext
            navigate('/');
        } else {
            setError(response.data.message || 'Login failed. No token received.');
        }
    } catch (err: any) {
        // ... error handling ...
        console.error('LoginPage: Login error:', err); // For debugging
        setError(err.response?.data?.message || 'Invalid credentials or server error.');
    }
    setLoading(false);
};

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          border: '1px solid',
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}33`
        }}
      >
        <VpnKeyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 1, color: 'primary.main' }}>
          Admin Access
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          Server Command Interface
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
            InputLabelProps={{ style: { color: 'primary.main' } }}
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
            InputLabelProps={{ style: { color: 'primary.main' } }}
          />
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Secure Login'}
          </Button>
        </Box>
      </Paper>
       <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 3 }}>
        Hint: admin / admin
      </Typography>
    </Container>
  );
};

export default LoginPage;