import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Map common properties from typical Spring Boot JWT claims
                setUser({
                    email: decoded.sub || decoded.email,
                    role: decoded.role || (decoded.roles && decoded.roles[0]) || 'USER',
                    name: decoded.name || decoded.sub || 'User'
                });
            } catch (err) {
                console.error("Invalid or expired token", err);
                logout();
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const updateUser = (updates) => {
        setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : currentUser);
    };

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading context...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
