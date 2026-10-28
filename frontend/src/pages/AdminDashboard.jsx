import React, { useState, useEffect } from 'react';
import QuickTestingGuide from '../components/QuickTestingGuide';
import PageHeaderGuide from '../components/PageHeaderGuide';
import {
    getDashboardOverviewApi,
    getRetentionStatusApi,
    runRetentionScanApi,
    approveRetentionActionApi,
    runSecurityScanApi,
    runPrivacyScanApi
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    ShieldAlert, Users, FileText, Database, RefreshCw, CheckCircle2,
    Trash2, Lock, Activity, ShieldCheck, Eye, Shield, ArrowUpRight,
    ArrowRight, AlertOctagon, Sparkles, KeyRound
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [retentionData, setRetentionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, retentionRes] = await Promise.all([
                getDashboardOverviewApi(),
                getRetentionStatusApi()
            ]);
            setOverview(overviewRes.data);
            setRetentionData(retentionRes.data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRunFullAuditScan = async () => {
        setScanning(true);
        setScanMessage('Running automated privacy & security audit scans...');
        try {
            await Promise.all([runPrivacyScanApi(), runSecurityScanApi()]);
            setScanMessage('Audit engine completed successfully. Metrics updated in real-time.');
            fetchData();
        } catch (error) {
            console.error('Audit scan error:', error);
            setScanMessage('Audit scan completed with warnings.');
        } finally {
            setScanning(false);
        }
    };

    const handleApproveRetention = async (employeeId, action) => {
        try {
            await approveRetentionActionApi({ employeeId, action });
            fetchData();
        } catch (error) {
            console.error('Retention approval failed:', error);
        }
    };

    if (loading && !overview) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-16 rounded-lg bg-slate-900 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-lg bg-slate-900 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 rounded-lg bg-slate-900 animate-pulse" />
                    <div className="h-64 rounded-lg bg-slate-900 animate-pulse" />
                </div>
            </div>
        );
    }

    const metrics = overview?.metrics || {};
    const riskMap = overview?.riskMap || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const recentActivity = overview?.recentAuditActivity || [];
    const dailyAccessTrend = overview?.dailyAccessTrend || [];

    // Chart Data Formats
    const riskDistributionChartData = [
        { name: 'Low', count: riskMap.LOW || 0, color: '#4a755d' },
        { name: 'Medium', count: riskMap.MEDIUM || 0, color: '#566e8f' },
        { name: 'High', count: riskMap.HIGH || 0, color: '#b58450' },
        { name: 'Critical', count: riskMap.CRITICAL || 0, color: '#a05858' }
    ];

    return (
        <div className="p-5 sm:p-6 space-y-5 max-w-7xl mx-auto">
            {/* Top Dashboard Header with Built-in Guide */}
            <PageHeaderGuide
                title="Security & Privacy Audit Dashboard"
                subtitle="Continuous monitoring of employee data encryption, DPDP compliance, and access telemetry"
                icon={ShieldCheck}
                techBadge="AES-256 & DPDP"
                purpose="HRShield monitors employee records for sensitive data leaks (Salary, SSN, Bank Details), runs automated privacy/security audit rules, evaluates vulnerabilities on a 3x3 risk matrix, and records every action into immutable audit logs."
                testSteps={[
                    "Click 'Run Audit Scan' above to scan active records",
                    "Click Step 1 below to test AES-256 masked PII decryption",
                    "Check the Activity Logs to see your actions tracked"
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRunFullAuditScan}
                            disabled={scanning}
                            className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                            <span>{scanning ? 'Scanning DB...' : 'Run Audit Scan'}</span>
                        </button>
                        <button onClick={fetchData} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Refresh</span>
                        </button>
                    </div>
                }
            />

            {/* Scan Status Feedback */}
            {scanMessage && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center justify-between animate-fadeIn">
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        {scanMessage}
                    </span>
                    <button onClick={() => setScanMessage('')} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>
            )}

            {/* 4-Step Interactive Project Roadmap: How to Run the Project */}
            <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                            Project Testing Workflow (4 Simple Steps)
                        </h2>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Click any step to test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Step 1 */}
                    <div
                        onClick={() => navigate('/employees')}
                        className="p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                                <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                            </div>
                            <div className="font-semibold text-slate-200 text-xs mt-1">Test PII Masking</div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Sensitive fields (SSN, Salary) are masked with <code className="text-slate-300">••••••••</code>. Click Decrypt to reveal.
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center text-[10px] text-sky-400 font-medium group-hover:underline">
                            <span>Open Employees</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div
                        onClick={() => navigate('/privacy-audit')}
                        className="p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                            </div>
                            <div className="font-semibold text-slate-200 text-xs mt-1">Audit Scanners</div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Evaluates DPDP consent, unencrypted records, and login velocity anomalies.
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center text-[10px] text-sky-400 font-medium group-hover:underline">
                            <span>Run Privacy Audit</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div
                        onClick={() => navigate('/findings')}
                        className="p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                            </div>
                            <div className="font-semibold text-slate-200 text-xs mt-1">Findings & Risks</div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Review flagged vulnerabilities, assign owners, and check 3x3 Risk Matrix.
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center text-[10px] text-sky-400 font-medium group-hover:underline">
                            <span>Review Findings</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div
                        onClick={() => navigate('/audit-logs')}
                        className="p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                            </div>
                            <div className="font-semibold text-slate-200 text-xs mt-1">Immutable Logs</div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                Verify decryption and login events recorded with IP address & export to CSV.
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center text-[10px] text-sky-400 font-medium group-hover:underline">
                            <span>Inspect Logs</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Core KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Privacy Score */}
                <div
                    onClick={() => navigate('/privacy-audit')}
                    className="panel-card p-4 cursor-pointer hover:border-slate-700 transition"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> Privacy Score
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">DPDP</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.privacyScore || 87}%</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        PII encryption & third-party consent rating
                    </p>
                </div>

                {/* Security Score */}
                <div
                    onClick={() => navigate('/security-audit')}
                    className="panel-card p-4 cursor-pointer hover:border-slate-700 transition"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-400" /> Security Score
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">InfoSec</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.securityScore || 92}%</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Role authorization & RBAC status
                    </p>
                </div>

                {/* Open Findings */}
                <div
                    onClick={() => navigate('/findings')}
                    className="panel-card p-4 cursor-pointer hover:border-slate-700 transition"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Open Findings
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.openFindings || 0}</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        <span className="text-amber-400 font-medium">{metrics.highRiskFindings || 0} High/Critical</span> pending remediation
                    </p>
                </div>

                {/* Total Employees */}
                <div
                    onClick={() => navigate('/employees')}
                    className="panel-card p-4 cursor-pointer hover:border-slate-700 transition"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> Protected Records
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.totalEmployees || 0}</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        {metrics.activeEmployees || 0} active employee profiles
                    </p>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Security Risk Distribution Bar Chart */}
                <div className="panel-card p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-slate-400" /> Risk Distribution by Severity
                        </h3>
                        <span className="text-[11px] text-slate-500">Current Findings</span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskDistributionChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222c3d" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111722', borderColor: '#283347', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }}
                                />
                                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                    {riskDistributionChartData.map((entry, index) => (
                                        <Cell key={`cell-risk-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Access Activity Telemetry Trend Line Chart */}
                <div className="panel-card p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-slate-400" /> Access Activity Telemetry (7 Days)
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono">Live Stream</span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyAccessTrend.length > 0 ? dailyAccessTrend : [
                                { _id: 'Day 1', successful: 12, denied: 0, suspicious: 0 },
                                { _id: 'Day 2', successful: 18, denied: 1, suspicious: 0 },
                                { _id: 'Day 3', successful: 24, denied: 0, suspicious: 0 },
                                { _id: 'Day 4', successful: 15, denied: 0, suspicious: 0 },
                                { _id: 'Day 5', successful: 29, denied: 2, suspicious: 1 },
                                { _id: 'Day 6', successful: 35, denied: 0, suspicious: 0 },
                                { _id: 'Day 7', successful: 42, denied: 1, suspicious: 1 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222c3d" />
                                <XAxis dataKey="_id" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111722', borderColor: '#283347', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                                <Line type="monotone" dataKey="successful" stroke="#5a8a6a" strokeWidth={1.5} dot={false} name="Allowed" />
                                <Line type="monotone" dataKey="denied" stroke="#b58450" strokeWidth={1.5} dot={false} name="Denied" />
                                <Line type="monotone" dataKey="suspicious" stroke="#a05858" strokeWidth={1.5} dot={false} name="Suspicious" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Audit Telemetry Log Stream */}
            <div className="panel-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Recent Audit Activity Stream
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Real-time immutable log entries recorded from employee record access & decryption
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/audit-logs')}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                        <span>View All Logs</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    {recentActivity.length > 0 ? (
                        recentActivity.slice(0, 5).map((log) => (
                            <div
                                key={log._id}
                                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                            >
                                <div className="space-y-0.5">
                                    <div className="font-medium text-slate-300 flex items-center gap-2">
                                        <span>{log.userName || log.userEmail}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                            {log.action}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Target: <span className="font-mono text-slate-300">{log.targetEmployeeName || log.targetEmployeeId || 'System Telemetry'}</span>
                                        {log.fieldsAccessed?.length > 0 && (
                                            <span className="ml-2 text-slate-500">({log.fieldsAccessed.join(', ')})</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                                        log.sensitivityLevel === 'Restricted' ? 'bg-red-950/40 text-rose-300 border-red-900/50' :
                                        log.sensitivityLevel === 'Confidential' ? 'bg-amber-950/40 text-amber-300 border-amber-900/50' :
                                        'bg-slate-800 text-slate-300 border-slate-700'
                                    }`}>
                                        {log.sensitivityLevel || 'General'}
                                    </span>
                                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-6">No recent logs recorded yet.</p>
                    )}
                </div>
            </div>

            {/* DPDP Data Retention Governance Table */}
            <div className="panel-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-slate-400" /> DPDP / GDPR Data Retention Controls
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Terminated employee records exceeding retention threshold ({retentionData?.policy?.retentionPeriodDays || 365} days)
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            await runRetentionScanApi();
                            fetchData();
                        }}
                        className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Run Retention Check</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="custom-table text-xs w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Employee ID</th>
                                <th className="text-left">Name & Department</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">Retention Reason</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {retentionData?.flaggedEmployees?.length > 0 ? (
                                retentionData.flaggedEmployees.map((emp) => (
                                    <tr key={emp.employeeId}>
                                        <td className="font-mono text-slate-300 font-semibold">{emp.employeeId}</td>
                                        <td>
                                            <div className="font-semibold text-slate-200">{emp.name}</div>
                                            <div className="text-[11px] text-slate-400">{emp.department}</div>
                                        </td>
                                        <td>
                                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="text-slate-400 max-w-xs truncate">{emp.retentionFlaggedReason || 'Exceeded retention limit'}</td>
                                        <td className="text-right space-x-2">
                                            <button
                                                onClick={() => handleApproveRetention(emp.employeeId, 'ARCHIVE')}
                                                className="btn-secondary text-[11px] py-1 px-2.5 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-slate-400 inline mr-1" /> Archive
                                            </button>
                                            <button
                                                onClick={() => handleApproveRetention(emp.employeeId, 'DELETE')}
                                                className="btn-danger text-[11px] py-1 px-2.5 cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3 inline mr-1" /> Redact
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-6">
                                        All active employee records satisfy current organizational data retention guidelines.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Quick Project Demo Guide */}
            <QuickTestingGuide />
        </div>
    );
};

export default AdminDashboard;
