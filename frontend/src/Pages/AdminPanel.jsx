import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
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

export default function AdminPanel() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [assigningId, setAssigningId] = useState(null);
    const [staffIdInput, setStaffIdInput] = useState('');

    const [departments, setDepartments] = useState([]);
    const [newDeptName, setNewDeptName] = useState('');
    const [loadingDepts, setLoadingDepts] = useState(true);

    const fetchDepartments = async () => {
        setLoadingDepts(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load departments');
        } finally {
            setLoadingDepts(false);
        }
    };

    const fetchTickets = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/tickets/paginated?page=${pageNumber}&size=10`);
            if (res.data && res.data.content) {
                setTickets(res.data.content);
                setTotalPages(res.data.totalPages);
                setPage(res.data.number || pageNumber);
            } else {
                const allData = Array.isArray(res.data) ? res.data : [];
                setTickets(allData.slice(pageNumber * 10, (pageNumber + 1) * 10));
                setTotalPages(Math.ceil(allData.length / 10));
                setPage(pageNumber);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets(0);
        fetchDepartments();
    }, []);

    const handleCreateDepartment = async () => {
        if (!newDeptName.trim()) {
            toast.error('Please enter a department name');
            return;
        }
        try {
            await api.post('/departments', { name: newDeptName });
            toast.success('Department created');
            setNewDeptName('');
            fetchDepartments();
        } catch (err) {
            toast.error('Failed to create department');
        }
    };

    const handleStatusChange = async (ticketId, selectedStatus) => {
        try {
            await api.put(`/tickets/status/${ticketId}?status=${selectedStatus}`);
            toast.success('Status updated successfully');
            fetchTickets(page);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleAssign = async (ticketId) => {
        if (!staffIdInput.trim()) {
            toast.error('Please enter a staff ID');
            return;
        }
        try {
            await api.put(`/tickets/assign/${ticketId}/${staffIdInput}`);
            toast.success('Ticket assigned successfully');
            setAssigningId(null);
            setStaffIdInput('');
            fetchTickets(page);
        } catch (err) {
            toast.error('Failed to assign ticket');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
                <p className="text-foreground/60 mt-1">Manage all service requests, users, and system settings.</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-border/50 shadow-soft overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                        <CardTitle>Global Ticket Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="py-12"><Loader /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-foreground/60 uppercase bg-muted/30">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Ticket</th>
                                            <th className="px-6 py-4 font-medium">Current Status</th>
                                            <th className="px-6 py-4 font-medium">Change Status</th>
                                            <th className="px-6 py-4 font-medium">Assign To</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {tickets.length > 0 ? tickets.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{req.title}</div>
                                                    <div className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">#{req.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4 max-w-[150px]">
                                                    <select
                                                        className="bg-background border border-border text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                                        value={req.status || 'PENDING'}
                                                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                                    >
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                                        <option value="RESOLVED">RESOLVED</option>
                                                        <option value="CLOSED">CLOSED</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {assigningId === req.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Staff ID"
                                                                className="bg-background border border-border text-sm rounded-lg p-2 w-24"
                                                                value={staffIdInput}
                                                                onChange={(e) => setStaffIdInput(e.target.value)}
                                                            />
                                                            <Button size="sm" onClick={() => handleAssign(req.id)}>Save</Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setAssigningId(null)} className="bg-card hover:bg-muted text-foreground">Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {req.assignedTo || req.assignedStaff ? (
                                                                <span className="text-sm font-medium">{req.assignedTo || req.assignedStaff}</span>
                                                            ) : (
                                                                <span className="text-xs text-foreground/50 italic">Unassigned</span>
                                                            )}
                                                            <Button size="sm" variant="outline" onClick={() => setAssigningId(req.id)} className="h-8 ml-auto border-border">
                                                                <Edit2 size={14} className="mr-1" /> Assign
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
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
                                <span className="text-sm text-foreground/60">Page {page + 1} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => fetchTickets(page - 1)} className="border-border bg-card">Prev</Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => fetchTickets(page + 1)} className="border-border bg-card">Next</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card className="border-border/50 shadow-soft overflow-hidden mt-8">
                    <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                        <CardTitle>Departments Management</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium mb-4">Existing Departments</h3>
                                {loadingDepts ? (
                                    <Loader />
                                ) : (
                                    <ul className="space-y-2">
                                        {departments.length > 0 ? departments.map(dept => (
                                            <li key={dept.id} className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center">
                                                <span className="font-medium">{dept.name}</span>
                                                <span className="text-xs text-foreground/50">ID: {dept.id}</span>
                                            </li>
                                        )) : (
                                            <li className="text-foreground/50 text-sm">No departments found.</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <div className="w-full md:w-1/3">
                                <h3 className="text-lg font-medium mb-4">Create New</h3>
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Department Name"
                                            className="w-full p-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleCreateDepartment} className="w-full">Add Department</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
