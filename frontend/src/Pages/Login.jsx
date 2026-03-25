import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Input } from '../Components/ui/Input';
import { Button } from '../Components/ui/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../Services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', formData);
      const token = res.data.token || res.data.jwt || res.data;
      if (token && typeof token === 'string') {
        login(token);
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/30 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 p-4"
      >
        <div className="glass-card p-8 w-full border border-white/20 dark:border-white/10 shadow-glass rounded-3xl bg-white/60 dark:bg-slate-900/60">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg shrink-0">
              <span className="font-bold text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-foreground/60 mt-2">Enter your credentials to access the dashboard</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="name@company.com"
              label="Email Address"
              icon={Mail}
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              icon={Lock}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="flex items-center justify-between text-sm mt-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary/20 accent-primary w-4 h-4 cursor-pointer" />
                <span className="text-foreground/70">Remember me</span>
              </label>
              <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full h-12 text-base group mt-2" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}