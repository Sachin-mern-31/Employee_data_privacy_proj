import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../services/api';
import SensitivityBadge from '../components/SensitivityBadge';
import {
    FileText,
    Search,
    Filter,
    ShieldAlert,
    AlertTriangle,
    Download,
    RefreshCw,
    CheckCircle,
    Globe
} from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sensitivityFilter, setSensitivityFilter] = useState('');
    const [anomalyOnly, setAnomalyOnly] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await getAuditLogsApi({
                search,
                sensitivityLevel: sensitivityFilter,
                anomalyOnly: anomalyOnly ? 'true' : 'false'
            });
            setLogs(res.data || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [search, sensitivityFilter, anomalyOnly]);

    const handleExportCSV = () => {
        if (!logs.length) return;

        const headers = ['Timestamp', 'User Name', 'User Email', 'User Role', 'Action', 'Target Employee ID', 'Target Employee Name', 'Fields Accessed', 'Sensitivity', 'IP Address', 'Status', 'Anomaly Flagged', 'Anomaly Reason'];
        
        const rows = logs.map(l => [
            new Date(l.createdAt).toISOString(),
            `"${l.userName || ''}"`,
            `"${l.userEmail || ''}"`,
            l.userRole || '',
            l.action || '',
            l.targetEmployeeId || '',
            `"${l.targetEmployeeName || ''}"`,
            `"${(l.fieldsAccessed || []).join(';')}"`,
            l.sensitivityLevel || '',
            l.ipAddress || '',
            l.status || '',
            l.anomalyFlagged ? 'YES' : 'NO',
            `"${l.anomalyReason || ''}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `hrshield_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-base font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" /> Audit Telemetry Logs
                    </h1>
                    <p className="text-xs text-slate-400">
                        Append-only log records tracking PII reads, edits, updates, and exports
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchLogs} className="btn-secondary text-xs flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>

                    <button onClick={handleExportCSV} className="btn-primary text-xs flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Export (CSV)
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="panel-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
                <div className="relative flex-1 w-full">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search logs by user, action, target..."
                        className="input-field pl-8 text-xs"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={sensitivityFilter}
                        onChange={(e) => setSensitivityFilter(e.target.value)}
                        className="input-field text-xs min-w-[130px]"
                    >
                        <option value="">All Levels</option>
                        <option value="Public">Public</option>
                        <option value="Internal">Internal</option>
                        <option value="Confidential">Confidential</option>
                        <option value="Restricted">Restricted</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none shrink-0">
                        <input
                            type="checkbox"
                            checked={anomalyOnly}
                            onChange={(e) => setAnomalyOnly(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900"
                        />
                        <span className="text-slate-400">Anomalies Only</span>
                    </label>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="panel-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action & Target</th>
                                <th>Fields</th>
                                <th>Sensitivity</th>
                                <th>IP</th>
                                <th className="text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td>
                                            <div className="font-medium text-slate-200">{log.userName}</div>
                                            <div className="text-[11px] text-slate-500 font-mono">
                                                {log.userRole}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-slate-300 font-medium">{log.action}</span>
                                            {log.targetEmployeeName && (
                                                <div className="text-[11px] text-slate-500">
                                                    Target: {log.targetEmployeeName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="font-mono text-[11px] text-slate-400 max-w-xs truncate">
                                            {log.fieldsAccessed?.length > 0 ? log.fieldsAccessed.join(', ') : 'N/A'}
                                        </td>
                                        <td>
                                            <SensitivityBadge level={log.sensitivityLevel} />
                                        </td>
                                        <td className="font-mono text-[11px] text-slate-500">
                                            {log.ipAddress}
                                        </td>
                                        <td className="text-right">
                                            {log.anomalyFlagged ? (
                                                <span className="px-1.5 py-0.5 rounded bg-red-950/30 text-rose-300 border border-red-900/40 text-[10px] font-mono" title={log.anomalyReason}>
                                                    Anomaly
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-[11px] font-mono">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">
                                        {loading ? 'Fetching security logs...' : 'No audit log entries found matching criteria.'}
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

export default AuditLogs;

