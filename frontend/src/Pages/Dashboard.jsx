import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { Loader } from '../Components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import api from '../Services/api';
import { getLocaleForLanguage } from '../utils/preferences';
import toast from 'react-hot-toast';

const getStatusBadge = (status) => {
  if (!status) return <Badge>Unknown</Badge>;
  switch (status.toUpperCase()) {
    case 'RESOLVED':
    case 'COMPLETED':
    case 'DONE': return <Badge variant="success">{status}</Badge>;
    case 'PENDING':
    case 'OPEN': return <Badge variant="warning">{status}</Badge>;
    case 'IN PROGRESS':
    case 'IN_PROGRESS': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const getPriorityColor = (priority) => {
  if (!priority) return 'text-foreground/70';
  switch (priority.toUpperCase()) {
    case 'CRITICAL': return 'text-destructive';
    case 'HIGH': return 'text-orange-500';
    case 'MEDIUM': return 'text-warning';
    case 'LOW': return 'text-success';
    default: return 'text-foreground/70';
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const locale = getLocaleForLanguage(preferences.language);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let statsRes;
        if (user?.role === 'ADMIN') {
          try {
            statsRes = await api.get('/admin/reports/dashboard');      // ✅
          } catch {
            statsRes = await api.get('/tickets');                      // ✅
          }
        } else {
          statsRes = await api.get('/tickets/my');                        // ✅
        }

        const rawData = statsRes.data;
        if (Array.isArray(rawData) || (rawData.content && Array.isArray(rawData.content))) {
          const ticketsArray = rawData.content || rawData;
          const total = ticketsArray.length;
          const pending = ticketsArray.filter(t => t.status?.toUpperCase() === 'PENDING').length;
          const resolved = ticketsArray.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase())).length;
          const inProgress = ticketsArray.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS' || t.status?.toUpperCase() === 'IN PROGRESS').length;

          setDashboardData({
            totalTickets: total,
            pending: pending,
            resolved: resolved,
            inProgress: inProgress,
            statusSummary: { PENDING: pending, RESOLVED: resolved, IN_PROGRESS: inProgress }
          });
          setRecentRequests(Array.isArray(ticketsArray) ? ticketsArray.slice(0, 5) : []);
        } else {
          setDashboardData(rawData);
          try {
            const endpoint = user?.role === 'ADMIN' ? '/tickets/paginated?page=0&size=5' : '/tickets/my';
            const tktRes = await api.get(endpoint);
            const ticketsArray = tktRes.data?.content || tktRes.data;
            setRecentRequests(Array.isArray(ticketsArray) ? ticketsArray.slice(0, 5) : []);
          } catch (e) {
            console.error("Could not fetch recent requests", e);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading) return <Loader />;
  if (!dashboardData) return <div className="p-8 text-center text-foreground/50">No data available yet. Please create a request.</div>;

  const stats = [
    { label: 'Total Requests', value: dashboardData.totalTickets || 0, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending', value: dashboardData.pending || dashboardData.statusSummary?.PENDING || 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Resolved', value: dashboardData.resolved || dashboardData.statusSummary?.RESOLVED || dashboardData.statusSummary?.CLOSED || 0, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'In Progress', value: dashboardData.inProgress || dashboardData.statusSummary?.IN_PROGRESS || 0, icon: AlertCircle, color: 'text-accent-500', bg: 'bg-accent-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-foreground/60 mt-1">Here's what's happening with your service requests today.</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
            <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <motion.div className="lg:col-span-7" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-foreground/50 uppercase bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ticket</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Priority</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {Array.isArray(recentRequests) && recentRequests.length > 0 ? recentRequests.map((req, i) => (
                      <motion.tr key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.05) }} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{req.title || 'Untitled Request'}</div>
                          <div className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">#{req.id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                        <td className="px-6 py-4"><span className={`font-medium ${getPriorityColor(req.priority)}`}>{req.priority || 'N/A'}</span></td>
                        <td className="px-6 py-4 text-foreground/50">{req.createdAt || req.date ? new Date(req.createdAt || req.date).toLocaleDateString(locale) : 'N/A'}</td>
                      </motion.tr>
                    )) : <tr><td colSpan="4" className="text-center py-6 text-foreground/50">No recent requests</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
