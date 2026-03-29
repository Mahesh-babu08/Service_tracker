import React, { useEffect, useState, useRef } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDark, setIsDark] = useState(
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (searchQuery.trim()) {
                navigate(`/requests?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                navigate('/requests');
            }
            setSearchQuery('');
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors">
                    <Menu size={24} />
                </button>
                <div className="hidden md:block w-full max-w-sm">
                    <Input 
                        type="text" 
                        placeholder="Search tickets (press Enter)..." 
                        icon={Search} 
                        className="h-10 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyPress} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full relative" title="Notifications">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" title="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="ml-2 h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent-400 p-[2px] cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                            {user?.name ? <span className="font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span> : <UserIcon size={16} />}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-glass p-1">
                            <div className="px-3 py-2 border-b border-border mb-1">
                                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                                    {user?.role}
                                </span>
                            </div>
                            <button
                                onClick={() => { setIsProfileOpen(false); logout(); }}
                                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
