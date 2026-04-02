import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const getStoredToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const buildUserFromToken = (decoded) => {
    const email = decoded.sub || decoded.email || '';
    const rawRole = decoded.role || (Array.isArray(decoded.roles) && decoded.roles[0]) || 'USER';
    const role = typeof rawRole === 'string' && rawRole.startsWith('ROLE_')
        ? rawRole.replace('ROLE_', '')
        : rawRole;

    return {
        email,
        role,
        // Prefer the explicit name from the JWT, then gracefully fall back to the email.
        name: decoded.name || decoded.fullName || email || 'User'
    };
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getStoredToken());
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(buildUserFromToken(decoded));
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
        sessionStorage.removeItem('token');
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = ({ redirect = true } = {}) => {
        // Clear both storage locations so auth pages can always force a clean session.
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);

        if (redirect) {
            navigate('/login');
        }
    };

    const clearAuth = () => {
        logout({ redirect: false });
    };

    const updateUser = (updates) => {
        setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : currentUser);
    };

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading context...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, clearAuth, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
