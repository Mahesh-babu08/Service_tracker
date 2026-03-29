import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { Button } from '../Components/ui/Button';
import { Loader } from '../Components/ui/Loader';
import api from '../Services/api';
import { useNotifications } from '../context/NotificationContext';
import { usePreferences } from '../context/PreferencesContext';
import { getLocaleForLanguage } from '../utils/preferences';

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
    const [departmentIdInput, setDepartmentIdInput] = useState('');

    const [departments, setDepartments] = useState([]);
    const [newDeptName, setNewDeptName] = useState('');
    const [loadingDepts, setLoadingDepts] = useState(true);

    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [departmentTickets, setDepartmentTickets] = useState([]);
    const [loadingDeptTickets, setLoadingDeptTickets] = useState(false);

    const { addNotification } = useNotifications();
    const { preferences } = usePreferences();
    const locale = getLocaleForLanguage(preferences.language);

    const departmentTicketsRef = useRef(null);

    const fetchDepartments = async () => {
        setLoadingDepts(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
            addNotification('Failed to load departments', 'error');
        } finally {
            setLoadingDepts(false);
        }
    };

    const fetchDepartmentTickets = async (departmentId) => {
        setLoadingDeptTickets(true);
        try {
            const res = await api.get(`/admin/tickets/department/${departmentId}`);
            setDepartmentTickets(res.data);
        } catch (err) {
            console.error(err);
            addNotification('Failed to load department tickets', 'error');
        } finally {
            setLoadingDeptTickets(false);
        }
    };

    const fetchTickets = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/tickets/paginated?page=${pageNumber}&size=10`);
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
            addNotification('Failed to load tickets', 'error');
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
            addNotification('Please enter a department name', 'error');
            return;
        }
        try {
            await api.post('/departments', { name: newDeptName });
            addNotification('Department created successfully', 'success', 'Department Added');
            setNewDeptName('');
            fetchDepartments();
        } catch (err) {
            addNotification('Failed to create department', 'error');
        }
    };

    const handleStatusChange = async (ticketId, selectedStatus) => {
        try {
            await api.put(`/admin/tickets/status/${ticketId}?status=${selectedStatus}`);
            addNotification(`Ticket status updated to ${selectedStatus}`, 'success', 'Status Changed');
            fetchTickets(page);
        } catch (err) {
            addNotification('Failed to update status', 'error');
        }
    };

    const handlePriorityChange = async (ticketId, selectedPriority) => {
        try {
            await api.put(`/admin/tickets/priority/${ticketId}?priority=${selectedPriority}`);
            addNotification(`Ticket priority updated to ${selectedPriority}`, 'success', 'Priority Changed');
            fetchTickets(page);
        } catch (err) {
            addNotification('Failed to update priority', 'error');
        }
    };

    const handleAssign = async (ticketId) => {
        if (!departmentIdInput.trim()) {
            addNotification('Please enter a department ID.', 'error');
            return;
        }

        try {
            await api.put(`/admin/tickets/assign-department/${ticketId}/${departmentIdInput}`);
            addNotification('Department assigned successfully.', 'success', 'Department Assigned');
            setAssigningId(null);
            setDepartmentIdInput('');
            fetchTickets(page);
            if (selectedDepartment) {
                fetchDepartmentTickets(selectedDepartment.id);
            }
        } catch (err) {
            addNotification('Failed to assign department.', 'error');
        }
    };

    const handleDepartmentClick = async (dept) => {
        setSelectedDepartment(dept);
        await fetchDepartmentTickets(dept.id);
        // Scroll to the department tickets section after loading
        setTimeout(() => {
            if (departmentTicketsRef.current) {
                departmentTicketsRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100); // Small delay to ensure the section is rendered
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
                                            <th className="px-6 py-4 font-medium">Priority</th>
                                            <th className="px-6 py-4 font-medium">Department</th>
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
                                                <td className="px-6 py-4 max-w-[150px]">
                                                    <select
                                                        className="bg-background border border-border text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                                        value={req.priority || 'MEDIUM'}
                                                        onChange={(e) => handlePriorityChange(req.id, e.target.value)}
                                                    >
                                                        <option value="LOW">LOW</option>
                                                        <option value="MEDIUM">MEDIUM</option>
                                                        <option value="HIGH">HIGH</option>
                                                        <option value="CRITICAL">CRITICAL</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {assigningId === req.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Department ID"
                                                                className="bg-background border border-border text-sm rounded-lg p-2 w-24"
                                                                value={departmentIdInput}
                                                                onChange={(e) => setDepartmentIdInput(e.target.value)}
                                                            />
                                                            <Button size="sm" onClick={() => handleAssign(req.id)}>Save</Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setAssigningId(null)} className="bg-card hover:bg-muted text-foreground">Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {req.department ? (
                                                                <span className="text-sm font-medium">{req.department.name}</span>
                                                            ) : (
                                                                <span className="text-xs text-foreground/50 italic">No Department</span>
                                                            )}
                                                            <Button size="sm" variant="outline" onClick={() => setAssigningId(req.id)} className="h-8 ml-auto border-border">
                                                                <Edit2 size={14} className="mr-1" /> Assign Dept
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-8 text-foreground/50">No tickets found.</td></tr>
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
                                            <li key={dept.id}>
                                                <button
                                                    onClick={() => handleDepartmentClick(dept)}
                                                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                                                        selectedDepartment?.id === dept.id
                                                            ? 'bg-primary/10 border-primary text-primary'
                                                            : 'bg-muted/30 border-border hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <div className="font-medium">{dept.name}</div>
                                                    <div className="text-xs text-foreground/50">ID: {dept.id}</div>
                                                </button>
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

            {selectedDepartment && (
                <motion.div ref={departmentTicketsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <Card className="border-border/50 shadow-soft overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                            <CardTitle>Tickets for {selectedDepartment.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingDeptTickets ? (
                                <div className="py-12"><Loader /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-foreground/60 uppercase bg-muted/30">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Ticket</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium">Priority</th>
                                                <th className="px-6 py-4 font-medium">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {departmentTickets.length > 0 ? departmentTickets.map((ticket) => (
                                                <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-foreground">{ticket.title}</div>
                                                        <div className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">#{ticket.id}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(ticket.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={ticket.priority === 'CRITICAL' ? 'destructive' : ticket.priority === 'HIGH' ? 'secondary' : 'outline'}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-foreground/70">
                                                        {new Date(ticket.createdAt).toLocaleDateString(locale)}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center py-8 text-foreground/50">No tickets found for this department.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
