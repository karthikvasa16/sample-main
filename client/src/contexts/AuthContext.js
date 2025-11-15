import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../config/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await apiClient.post('/api/auth/verify');
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          (error.message?.includes('Network') ? 'Unable to connect to server. Please check your connection.' : 'Login failed');
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '***' });
      const response = await apiClient.post('/api/auth/register', userData);
      console.log('Registration response:', response.data);
      
      // Don't auto-login on registration - user needs to verify email first
      // Just return success with message
      return { 
        success: true,
        message: response.data.message || 'Registration successful! Please check your email to verify your account.',
        requiresVerification: response.data.requiresVerification || false
      };
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        // Special handling for email errors
        if (error.response.data.emailError) {
          errorMessage = error.response.data.error;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network') || !error.response) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running on port 5000.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid registration data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during registration. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (googleToken, name, email, picture) => {
    try {
      const response = await apiClient.post('/api/auth/google', {
        googleToken,
        name,
        email,
        picture
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          (error.message?.includes('Network') ? 'Unable to connect to server. Please check your connection.' : 'Google login failed');
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
