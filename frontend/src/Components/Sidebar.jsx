import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import {
    LayoutDashboard,
    List,
    PlusCircle,
    ShieldCheck,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { Button } from './ui/Button';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'All Requests', href: '/requests', icon: List },
    { name: 'Create Request', href: '/create', icon: PlusCircle },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen, isMobile }) {
    const location = useLocation();

    const handleMobileClick = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-border bg-card shadow-soft flex flex-col",
                    isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                            S
                        </div>
                        {isOpen && <span className="font-semibold text-lg whitespace-nowrap">ServiceTracker</span>}
                    </div>
                    {!isMobile && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1 rounded-md hover:bg-accent text-gray-500"
                        >
                            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                    )}
                </div>

                <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                onClick={handleMobileClick}
                                className={cn(
                                    "flex items-center rounded-xl transition-all duration-200 group text-sm font-medium",
                                    isOpen ? "px-3 py-2.5" : "justify-center p-3 text-center",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                                )}
                                title={!isOpen ? item.name : undefined}
                            >
                                <item.icon size={20} className={cn("flex-shrink-0", isOpen && "mr-3")} />
                                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-border">
                    <NavLink
                        to="/login"
                        className={cn(
                            "flex items-center rounded-xl transition-all duration-200 group text-sm font-medium text-foreground/70 hover:bg-destructive/10 hover:text-destructive",
                            isOpen ? "px-3 py-2.5" : "justify-center p-3 text-center"
                        )}
                        title={!isOpen ? "Logout" : undefined}
                    >
                        <LogOut size={20} className={cn("flex-shrink-0", isOpen && "mr-3")} />
                        {isOpen && <span>Logout</span>}
                    </NavLink>
                </div>
            </aside>
        </>
    );
}
