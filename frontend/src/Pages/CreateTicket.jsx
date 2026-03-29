import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Box, AlignLeft, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../Components/ui/Card';
import { Input } from '../Components/ui/Input';
import { Button } from '../Components/ui/Button';
import api from '../Services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';

export default function CreateTicket() {
  const [formData, setFormData] = useState({ title: '', description: '', departmentId: '' });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);
  const navigate = useNavigate();
  const { user } = useAuth(); // Import from context

  if (user?.role === 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <h2 className="text-2xl font-bold text-foreground">Admin Access Restricted</h2>
        <p className="text-foreground/70 mt-2 max-w-md">
          Administrator accounts are strictly designated for managing operations and do not support creating native personal user service requests. Please log in as a generic User to submit tickets.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.departmentId) {
      showNotification('Title, description, and department are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tickets', formData);
      showNotification('Request submitted successfully!', 'success', 'Ticket Created');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showNotification('Failed to submit request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Request</h1>
        <p className="text-foreground/60 mt-1">Submit a new service request below.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Provide a clear title and detailed description of your issue.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Input
              label="Request Title"
              placeholder="e.g. Cannot access email server"
              icon={Box}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-5 w-5 text-foreground/50" />
                <select
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors appearance-none"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative pt-2">
              <div className="absolute left-3 top-5 text-gray-500 dark:text-gray-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                className="flex w-full rounded-xl border border-input dark:border-slate-700 bg-background/50 dark:bg-slate-900/50 px-3 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all pl-10 min-h-[200px] resize-y"
                placeholder="Detailed description of the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 pt-6 gap-3">
            <Button variant="outline" onClick={() => navigate('/requests')} disabled={loading} className="bg-card hover:bg-muted text-foreground">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}