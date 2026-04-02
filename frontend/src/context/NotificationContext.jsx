import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../Services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const normalizeNotification = (notification) => ({
    ...notification,
    isRead: notification?.isRead ?? notification?.read ?? false,
    timestamp: notification?.createdAt ? new Date(notification.createdAt) : new Date(),
    title: notification?.ticketTitle || 'Untitled Ticket',
    type: notification?.actionType === 'DELETED' ? 'warning' : 'info',
});

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const { token, user } = useAuth();

    const updateNotificationState = useCallback((incomingNotifications) => {
        const normalizedNotifications = Array.isArray(incomingNotifications)
            ? incomingNotifications.map(normalizeNotification)
            : [];

        setNotifications(normalizedNotifications);
        setUnreadCount(normalizedNotifications.filter((notification) => !notification.isRead).length);
    }, []);

    const loadNotifications = useCallback(async ({ showLoader = true } = {}) => {
        if (!token || !user?.email) {
            updateNotificationState([]);
            return [];
        }

        if (showLoader) {
            setLoadingNotifications(true);
        }

        try {
            const response = await api.get('/notifications');
            const loadedNotifications = Array.isArray(response.data) ? response.data : [];
            updateNotificationState(loadedNotifications);
            return loadedNotifications;
        } catch (error) {
            console.error('Failed to load notifications', error);
            return [];
        } finally {
            if (showLoader) {
                setLoadingNotifications(false);
            }
        }
    }, [token, updateNotificationState, user?.email]);

    const markAsRead = useCallback(async (id) => {
        const targetNotification = notifications.find((notification) => notification.id === id);

        if (!targetNotification || targetNotification.isRead) {
            return;
        }

        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id ? { ...notification, isRead: true } : notification
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    }, [notifications]);

    const markAllAsRead = useCallback(async () => {
        const unreadNotifications = notifications.filter((notification) => !notification.isRead);

        if (!unreadNotifications.length) {
            return;
        }

        try {
            await Promise.all(unreadNotifications.map((notification) => api.put(`/notifications/${notification.id}/read`)));
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
            await loadNotifications({ showLoader: false });
        }
    }, [loadNotifications, notifications]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => {
                const targetNotification = prev.find((notification) => notification.id === id);

                if (targetNotification && !targetNotification.isRead) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }

                return prev.filter((notification) => notification.id !== id);
            });
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    }, []);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to delete all notifications', error);
        }
    }, []);

    useEffect(() => {
        if (!token || !user?.email) {
            clearNotifications();
            return;
        }

        loadNotifications({ showLoader: false });
    }, [clearNotifications, loadNotifications, token, user?.email]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loadingNotifications,
            loadNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
