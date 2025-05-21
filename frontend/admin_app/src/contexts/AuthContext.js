import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define logout function first to avoid circular dependency
  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Now we can use logout in fetchUserProfile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);  // Add logout as a dependency

  useEffect(() => {
    console.log('Auth Context - Checking authentication state');
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        console.log('Token found, validating...');
        // Validate token by checking expiration
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          console.log('Token expired, logging out');
          logout();
        } else {
          // Set authorization header
          console.log('Token valid, setting Authorization header');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          console.log('Fetching user profile...');
          fetchUserProfile();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.setItem('loginError', 'Invalid token format');
        logout();
      }
    } else {
      console.log('No token found in localStorage');
      setIsLoading(false);
    }
  }, [fetchUserProfile, logout]); // Add logout to dependencies

  const login = async (username, password) => {
    try {
      console.log('AuthContext login - Attempting login for:', username);
      setError(null);
      setIsLoading(true);
      
      // Use authAPI instead of direct axios call
      const response = await authAPI.login(username, password);
      console.log('Login API response:', response.status);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        console.error('Login response missing token or user data');
        setError('Invalid server response. Please try again.');
        setIsLoading(false);
        return false;
      }
      
      console.log('Login successful, saving token and user data');
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('Authentication state updated:', { isAuthenticated: true, user: user.username });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response && error.response.status === 403) {
        setError('Access denied. Only admin users can login.');
      } else if (error.response && error.response.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 