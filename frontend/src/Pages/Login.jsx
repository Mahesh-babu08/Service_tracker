import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import API from '../Services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../Components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { login, clearAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Visiting auth pages should always start from a clean session.
    clearAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      // 🔥 Critical Fix: Extract JWT from 'message' field since AuthResponse doesn't output 'token' natively
      const token = res.data?.token || res.data?.jwt || res.data?.message || (typeof res.data === 'string' ? res.data : undefined);
      
      if (token && typeof token === 'string') {
        login(token);
        navigate('/dashboard');
      } else {
        alert('Malformed token response from server');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 transition-colors duration-300">
      <ThemeToggle />
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8 transition-colors">
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Welcome Back</h1>
        <p className="text-center text-foreground/70 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-foreground/50" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-foreground/50" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-6 font-medium border border-transparent"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground/70">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
