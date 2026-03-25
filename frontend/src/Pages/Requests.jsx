import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { Button } from '../Components/ui/Button';
import { Loader } from '../Components/ui/Loader';
import api from '../Services/api';
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

export default function Requests() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchTickets = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/tickets?page=${pageNumber}&size=10`);
            if (res.data && res.data.content) {
                setTickets(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
                setPage(res.data.number || pageNumber);
            } else {
                const allData = Array.isArray(res.data) ? res.data : [];
                setTickets(allData.slice(pageNumber * 10, (pageNumber + 1) * 10));
                setTotalPages(Math.ceil(allData.length / 10));
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
        fetchTickets(0);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
                    <p className="text-foreground/60 mt-1">View and track all your service requests.</p>
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {tickets.length > 0 ? tickets.map((req, i) => (
                                            <motion.tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{req.title}</div>
                                                    <div className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">#{req.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-medium ${getPriorityColor(req.priority)}`}>{req.priority || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-foreground/50">
                                                    {new Date(req.createdAt || req.date || new Date()).toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr><td colSpan="4" className="text-center py-8 text-foreground/50">No tickets found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
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
