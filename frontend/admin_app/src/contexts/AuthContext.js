import React, { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Verify token is valid
        const decodedToken = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired, logout
          logout();
        } else {
          // Token still valid, get user info
          authService.getCurrentUser()
            .then(response => {
              if (response.data.success) {
                setCurrentUser(response.data.user);
                setToken(storedToken);
              } else {
                logout();
              }
            })
            .catch(() => {
              logout();
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Save to state
        setCurrentUser(user);
        setToken(token);
        
        // Save to localStorage
        localStorage.setItem('token', token);
        
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setCurrentUser(null);
    setToken('');
    
    // Clear localStorage
    localStorage.removeItem('token');
  };

  // Register function for admin to create users
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return { 
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 