// client/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import apiClient from '../services/apiClient'; // Import your API client

interface User {
    id: string | number;
    username: string;
    // Add other user properties if present in your JWT payload
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null; // Store token in context too
    isLoading: boolean; // For initial auth check
    loginSuccess: (userData: User, token: string) => void; // Renamed from 'login'
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true

    // Effect to verify token on app load or when token changes in localStorage
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('authToken');
            console.log('[AuthContext] Verifying token on app load:', storedToken);
            if (storedToken) {
                setToken(storedToken); // Ensure context token is updated
                try {
                    // Optionally, make a call to a '/api/auth/me' endpoint to validate the token
                    // and get fresh user data with every app load.
                    // This ensures the token isn't just present but also valid.
                    console.log('[AuthContext] Verifying token with /api/auth/me');
                    const response = await apiClient.get('/auth/me'); // apiClient uses the token
                    if (response.data) { // Assuming /auth/me returns user object
                        setUser(response.data);
                        setIsAuthenticated(true);
                        console.log('[AuthContext] Token verified, user set:', response.data);
                    } else {
                        logout(); // Token invalid or /me endpoint failed
                    }
                } catch (error) {
                    console.error('[AuthContext] Token verification failed:', error);
                    logout(); // Clear auth state if token is invalid
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
            }
            setIsLoading(false);
        };

        verifyToken();
    }, []); // Run once on mount

    const loginSuccess = (userData: User, receivedToken: string) => {
        localStorage.setItem('authToken', receivedToken);
        setToken(receivedToken);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        console.log('[AuthContext] Login successful, state updated.');
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false); // Ensure loading is false on logout
        console.log('[AuthContext] User logged out, state cleared.');
        // Optionally, you might want to clear Axios default headers if you set them directly
        // delete apiClient.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, loginSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};