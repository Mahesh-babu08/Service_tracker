import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function AdminRoute({ children }) {
    const { token, user } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'ADMIN') {
        // Show error message and redirect to dashboard
        toast.error('Access denied: Admin privileges required');
        return <Navigate to="/dashboard" replace />;
    }

    return children ? children : <Outlet />;
}
