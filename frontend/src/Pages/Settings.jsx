import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, Moon, Sun, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../Components/ui/Card';
import { Input } from '../Components/ui/Input';
import { Button } from '../Components/ui/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user } = useAuth();
    const [isDark, setIsDark] = useState(
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [name, setName] = useState(user?.name || '');

    useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user]);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const saveProfile = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-foreground/60 mt-1">Manage your appearance and profile preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card className="h-full border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize how the dashboard looks on your device.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div className="flex items-center gap-3">
                                    {isDark ? <Moon className="text-primary" /> : <Sun className="text-warning" />}
                                    <div>
                                        <h4 className="font-medium text-sm">Dark Mode</h4>
                                        <p className="text-xs text-foreground/60">Toggle dark theme</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Card className="h-full border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Input
                                label="Full Name"
                                icon={User}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                label="Email Address"
                                icon={Key}
                                value={user?.email || 'N/A'}
                                disabled={true}
                                className="bg-muted/50 cursor-not-allowed opacity-70"
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                            <Button onClick={saveProfile}>
                                <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
