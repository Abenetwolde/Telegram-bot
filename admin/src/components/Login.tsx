import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../redux/Api/Auth';
import { setToken, setUser } from '../redux/authSlice';
import { useForm } from 'react-hook-form';
import logo from '../assets/logo.png'
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';

// Logo component
const Logo: React.FC = () => {
  return (
    <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
      <img src={logo} alt="Logo" style={{ height: '50px' }} />
    </Box>
  );
};

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSubmitLogin = async ({ email, password }) => {
    try {
      const userData = await loginUser({ email, password }).unwrap();
      if (userData.token) {
        dispatch(setUser(userData.user));
        dispatch(setToken(userData.token));
        navigate("/dashboard/user-analysis");
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
    }
  };
  const CustomLabel = ({ children }) => {
    const theme = useTheme()
    return (
        <Typography style={{ color: theme.palette.text.primary, marginBottom: '0.1rem' }}>
            {children}
        </Typography>
    );
};
  return (
    <>
      <Logo /> {/* Include the Logo component here */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Full viewport height
          backgroundColor: '#f5f5f5',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(handleSubmitLogin)}
          sx={{
            maxWidth: '500px',
            margin: 'auto',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
            Login 
          </Typography>
          <CustomLabel>Email</CustomLabel>
          <TextField
            fullWidth
            defaultValue="test-account@gmail.com" 
            // label="Email"
            {...register('email', {
              required: 'Email is required',
              minLength: {
                value: 3,
                message: 'Email must be at least 3 characters',
              },
            })}
            error={Boolean(errors.email)}
            margin="normal"
          />
            <CustomLabel>Password</CustomLabel>
          <TextField
            fullWidth
            defaultValue="1234" 
            type="password"
            // label="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 6 characters',
              },
            })}
            error={Boolean(errors.password)}
            margin="normal"
            sx={{ mt: 2 }}
          />
        
          <Button type="submit" size="large" variant="contained" color="primary" disabled={isLoading} fullWidth sx={{ mt: 2 }}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </Box>
      <ToastContainer />
    </>
  );
};

export default Login;
