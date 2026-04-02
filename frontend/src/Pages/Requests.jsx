import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { Button } from '../Components/ui/Button';
import { Loader } from '../Components/ui/Loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import api from '../Services/api';
import { getLocaleForLanguage } from '../utils/preferences';
import toast from 'react-hot-toast';

const PAGE_SIZE = 6;

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

const canUserDeleteTicket = (ticket, user) => {
    if (user?.role !== 'USER') {
        return false;
    }

    const normalizedStatus = ticket?.status?.toUpperCase();
    return normalizedStatus !== 'IN_PROGRESS' && normalizedStatus !== 'IN PROGRESS';
};

const normalizeStatusFilter = (value) => {
    if (!value) {
        return '';
    }

    const normalized = value.toUpperCase().replace(/\s+/g, '_');
    return normalized === 'ALL' ? '' : normalized;
};

const normalizePriorityFilter = (value) => {
    return value ? value.toUpperCase() : '';
};

export default function Requests() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const searchString = searchParams.get('search') || '';
    const statusFilter = normalizeStatusFilter(searchParams.get('status'));
    const priorityFilter = normalizePriorityFilter(searchParams.get('priority'));
    const { user } = useAuth();
    const { preferences } = usePreferences();
    const locale = getLocaleForLanguage(preferences.language);

    const isAdmin = user?.role === 'ADMIN';

    const fetchTickets = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const trimmedSearch = searchString.trim();
            let endpoint = `/tickets/my?page=${pageNumber}&size=${PAGE_SIZE}`;

            if (isAdmin) {
                if (statusFilter) endpoint = `/tickets/filter/status?status=${statusFilter}&page=${pageNumber}&size=${PAGE_SIZE}`;
                else if (priorityFilter) endpoint = `/tickets/filter/priority?priority=${priorityFilter}&page=${pageNumber}&size=${PAGE_SIZE}`;
                else if (trimmedSearch) endpoint = `/tickets/search?keyword=${encodeURIComponent(trimmedSearch)}&page=${pageNumber}&size=${PAGE_SIZE}`;
                else endpoint = `/tickets?page=${pageNumber}&size=${PAGE_SIZE}`;
            } else {
                if (statusFilter) endpoint += `&status=${statusFilter}`;
                else if (priorityFilter) endpoint += `&priority=${priorityFilter}`;
                else if (trimmedSearch) endpoint += `&search=${encodeURIComponent(trimmedSearch)}`;
            }

            const res = await api.get(endpoint);
            if (res.data && res.data.content) {
                setTickets(res.data.content);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
                setPage(res.data.number || pageNumber);
            } else {
                const allData = Array.isArray(res.data) ? res.data : [];
                setTickets(allData.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE));
                setTotalPages(Math.max(1, Math.ceil(allData.length / PAGE_SIZE)));
                setTotalElements(allData.length);
                setPage(pageNumber);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load API data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        fetchTickets(0);
    }, [isAdmin, location.search, user?.email]);

    const updateFilterParam = (key, value) => {
        const nextParams = new URLSearchParams(location.search);

        // Keep one primary server-side filter active at a time to mirror the existing endpoint behavior.
        if (key === 'status' && value) {
            nextParams.delete('priority');
        }

        if (key === 'priority' && value) {
            nextParams.delete('status');
        }

        if (value) {
            nextParams.set(key, value);
        } else {
            nextParams.delete(key);
        }

        const nextSearch = nextParams.toString();
        navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`);
    };

    const handleDeleteTicket = async (ticketId) => {
        const confirmed = window.confirm('Are you sure you want to delete this ticket?');
        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/tickets/${ticketId}`);
            toast.success('Ticket deleted successfully');

            const nextTotalElements = Math.max(totalElements - 1, 0);
            const nextTotalPages = Math.max(1, Math.ceil(nextTotalElements / PAGE_SIZE));

            setTotalElements(nextTotalElements);
            setTotalPages(nextTotalPages);
            setTickets((currentTickets) => {
                const updatedTickets = currentTickets.filter((ticket) => ticket.id !== ticketId);

                if (updatedTickets.length === 0 && page > 0) {
                    setTimeout(() => fetchTickets(page - 1), 0);
                }

                return updatedTickets;
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete ticket');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
                    <p className="text-foreground/60 mt-1">View and track all your service requests.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        className="bg-background border border-border text-sm rounded-lg focus:ring-primary p-2 w-full sm:w-auto"
                        value={statusFilter}
                        onChange={(event) => updateFilterParam('status', event.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select
                        className="bg-background border border-border text-sm rounded-lg focus:ring-primary p-2 w-full sm:w-auto"
                        value={priorityFilter}
                        onChange={(event) => updateFilterParam('priority', event.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-border/50 shadow-soft overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                        <CardTitle>Tickets List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="py-12"><Loader /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-foreground/60 uppercase bg-muted/30">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Title</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Priority</th>
                                            <th className="px-6 py-4 font-medium text-right">Created Date</th>
                                            {!isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {tickets.length > 0 ? tickets.map((req) => (
                                            <motion.tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{req.title}</div>
                                                    <div className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">#{req.id}</div>
                                                    {isAdmin && req.deletedByUser && (
                                                        // Keep user-soft-deleted tickets visible to admins with context.
                                                        <div className="mt-2 text-xs font-medium text-destructive">
                                                            This ticket was deleted by the user
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-medium ${getPriorityColor(req.priority)}`}>{req.priority || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-foreground/50">
                                                    {new Date(req.createdAt || req.date || new Date()).toLocaleString(locale)}
                                                </td>
                                                {!isAdmin && (
                                                    <td className="px-6 py-4 text-right">
                                                        {canUserDeleteTicket(req, user) ? (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDeleteTicket(req.id)}
                                                                className="h-8"
                                                            >
                                                                <Trash2 size={14} className="mr-1" /> Delete
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-foreground/40">Unavailable</span>
                                                        )}
                                                    </td>
                                                )}
                                            </motion.tr>
                                        )) : (
                                            <tr><td colSpan={isAdmin ? 4 : 5} className="text-center py-8 text-foreground/50">
                                                {searchString ? `No tickets match "${searchString}"` : 'No tickets found.'}
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card rounded-b-2xl">
                                <span className="text-sm text-foreground/60">
                                    Showing page {page + 1} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 0}
                                        onClick={() => fetchTickets(page - 1)}
                                        className="bg-muted/50 border-border"
                                    >
                                        <ChevronLeft size={16} className="mr-1" /> Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages - 1}
                                        onClick={() => fetchTickets(page + 1)}
                                        className="bg-muted hover:bg-muted/80 border-border"
                                    >
                                        Next <ChevronRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
