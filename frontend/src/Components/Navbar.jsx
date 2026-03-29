import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, LogOut, User as UserIcon, CheckCheck, Trash2, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const navigate = useNavigate();
    // const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const isDark = theme === 'dark';

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef, notificationsRef]);

    // Removed search bar functionality

    const handleNotificationClick = (id) => {
        markAsRead(id);
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    const handleClearAll = () => {
        clearNotifications();
        setIsNotificationsOpen(false);
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info':
            default: return 'ℹ️';
        }
    };

    const userInitials = user?.name
        ? user.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('')
        : 'U';

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors">
                    <Menu size={24} />
                </button>
                {/* Search bar removed */}
            </div>

            <div className="flex items-center gap-3">
                <div className="relative" ref={notificationsRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="rounded-full relative"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive border-2 border-background text-xs font-bold flex items-center justify-center text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 max-h-96 rounded-xl border border-border bg-card shadow-glass overflow-hidden z-50">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="font-semibold">Notifications</h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleMarkAllRead}
                                            className="text-xs h-7 px-2"
                                        >
                                            <CheckCheck size={14} className="mr-1" />
                                            Mark all read
                                        </Button>
                                    )}
                                    {notifications.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearAll}
                                            className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification.id)}
                                            className={`p-4 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors ${
                                                !notification.read ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-sm">{notification.title}</h4>
                                                        <span className="text-xs text-foreground/50">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-foreground/50">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" title="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`group ml-1 flex items-center gap-3 rounded-2xl border px-2 py-1.5 text-left transition-all ${
                            isProfileOpen
                                ? 'border-primary/40 bg-primary/10 shadow-lg shadow-primary/10'
                                : 'border-transparent hover:border-border hover:bg-muted/60'
                        }`}
                    >
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-sky-400 to-emerald-400 blur-md transition-opacity ${
                                isProfileOpen ? 'opacity-70' : 'opacity-0 group-hover:opacity-35'
                            }`}></div>
                            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-primary via-sky-400 to-emerald-400 p-[2px] shadow-lg">
                                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-card text-sm font-bold text-foreground">
                                    {user?.name ? userInitials : <UserIcon size={16} />}
                                </div>
                            </div>
                            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-400 shadow-sm"></span>
                        </div>

                        <div className="hidden min-w-0 sm:block">
                            <p className="max-w-[140px] truncate text-sm font-semibold text-foreground">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">
                                {user?.role || 'USER'} account
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`hidden text-foreground/55 transition-transform sm:block ${
                                isProfileOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur-xl"
                            >
                                <div className="relative overflow-hidden border-b border-border/60 px-5 py-5">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_45%)]"></div>
                                    <div className="relative flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-sky-400 to-emerald-400 p-[2px] shadow-lg">
                                            <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-card text-lg font-bold text-foreground">
                                                {user?.name ? userInitials : <UserIcon size={20} />}
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-base font-semibold text-foreground">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="truncate text-sm text-foreground/60">
                                                {user?.email}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                                    {user?.role || 'USER'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                    Active session
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/settings');
                                        }}
                                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted/70"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <SettingsIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Profile settings</p>
                                            <p className="text-xs text-foreground/55">Manage account details and preferences</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            logout();
                                        }}
                                        className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-destructive/10"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                            <LogOut size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-destructive">Sign out</p>
                                            <p className="text-xs text-foreground/55">End this session securely</p>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
