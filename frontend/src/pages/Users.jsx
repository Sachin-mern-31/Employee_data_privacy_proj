import React, { useState, useEffect } from 'react';
import { getUsersApi, updateUserApi } from '../services/api';
import { UserCheck, Shield, UserX, RefreshCw, Search } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsersApi();
            setUsers(res.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            await updateUserApi(userId, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user role:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        setUpdatingId(userId);
        try {
            await updateUserApi(userId, { isActive: !currentStatus });
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-500" /> User Management
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        System accounts, security role assignment, and access state
                    </p>
                </div>
                <button onClick={fetchUsers} className="btn-secondary text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
            </div>

            {/* Filter Search */}
            <div className="panel-card p-3">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name, email, or role..."
                        className="input-field pl-9 text-xs"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="panel-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Name & Email</th>
                                <th>Department</th>
                                <th>Assigned Security Role</th>
                                <th>Linked Employee ID</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                                        </td>
                                        <td>
                                            <span className="text-slate-700 dark:text-slate-300">{u.department || 'General'}</span>
                                        </td>
                                        <td>
                                            <select
                                                value={u.role}
                                                disabled={updatingId === u._id}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="input-field py-1 text-xs font-mono max-w-[170px]"
                                            >
                                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                                <option value="SECURITY_AUDITOR">SECURITY_AUDITOR</option>
                                                <option value="HR_MANAGER">HR_MANAGER</option>
                                                <option value="HR_STAFF">HR_STAFF</option>
                                                <option value="EMPLOYEE">EMPLOYEE</option>
                                            </select>
                                        </td>
                                        <td className="font-mono text-slate-700 dark:text-slate-300 font-medium">{u.employeeId || 'N/A'}</td>
                                        <td>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                                    u.isActive
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                                        : 'bg-[#231819] text-[#c77a7f] border-[#3f2427]'
                                                }`}
                                            >
                                                {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => handleStatusToggle(u._id, u.isActive)}
                                                disabled={updatingId === u._id}
                                                className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1.5"
                                            >
                                                {u.isActive ? <UserX className="w-3 h-3 text-slate-400" /> : <UserCheck className="w-3 h-3 text-slate-400" />}
                                                {u.isActive ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-500 py-8">
                                        {loading ? 'Fetching system users...' : 'No matching users found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;

