import React, { useState, useEffect } from 'react';
import { getRBACMatrixApi } from '../services/api';
import { Lock, Shield, Check, X, ShieldAlert } from 'lucide-react';

const AccessControl = () => {
    const [matrix, setMatrix] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatrix = async () => {
            try {
                const res = await getRBACMatrixApi();
                setMatrix(res.data || []);
            } catch (error) {
                console.error('Error fetching RBAC Matrix:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatrix();
    }, []);

    const renderAccessBadge = (value) => {
        if (!value || value === 'None' || value === '✗') {
            return (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 text-slate-500 font-mono text-[10px] inline-flex items-center gap-1 border border-slate-200 dark:border-slate-800">
                    <X className="w-3 h-3 text-slate-400" /> Denied
                </span>
            );
        }
        if (value.includes('Full') || value === '✓') {
            return (
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-[10px] font-medium border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-slate-600 dark:text-slate-300" /> Full Access
                </span>
            );
        }
        if (value.includes('Audit')) {
            return (
                <span className="px-2 py-0.5 rounded bg-[#231e17] text-[#c0a273] font-mono text-[10px] font-medium border border-[#3e3425] inline-flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-[#c0a273]" /> {value}
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] border border-slate-300 dark:border-slate-700">
                {value}
            </span>
        );
    };

    return (
        <div className="p-5 space-y-4">
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" /> Role-Based Access Control (RBAC) Matrix
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Server-side enforced permission rules across system security roles
                </p>
            </div>

            {/* Matrix Table */}
            <div className="panel-card overflow-hidden">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-500" /> System Permission Rules Specification
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Enforced Server-Side</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Permission Capability</th>
                                <th>Super Admin</th>
                                <th>Security Auditor</th>
                                <th>HR Manager</th>
                                <th>HR Staff</th>
                                <th>Employee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="font-medium text-slate-900 dark:text-slate-200">{row.permission}</td>
                                    <td>{renderAccessBadge(row.SUPER_ADMIN)}</td>
                                    <td>{renderAccessBadge(row.SECURITY_AUDITOR)}</td>
                                    <td>{renderAccessBadge(row.HR_MANAGER)}</td>
                                    <td>{renderAccessBadge(row.HR_STAFF)}</td>
                                    <td>{renderAccessBadge(row.EMPLOYEE)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
