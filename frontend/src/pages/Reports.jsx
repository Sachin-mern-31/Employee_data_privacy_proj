import React, { useState, useEffect } from 'react';
import { getReportApi } from '../services/api';
import { FileCheck2, Printer, Download, RefreshCw, ShieldCheck, AlertTriangle, Eye, Shield } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const Reports = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await getReportApi();
            setReport(res.data);
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading && !report) {
        return (
            <div className="p-8 text-center text-slate-500">
                Compiling Executive Audit Report snapshot...
            </div>
        );
    }

    const summary = report?.summary || {};
    const findings = report?.findings || [];
    const risks = report?.risks || [];

    return (
        <div className="p-5 space-y-4 max-w-4xl mx-auto">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <div>
                    <h1 className="text-base font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-slate-400" /> Security & Privacy Audit Report
                    </h1>
                    <p className="text-xs text-slate-400">
                        Formal evaluation snapshot for compliance and executive defense
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchReport} className="btn-secondary text-xs flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Re-Generate
                    </button>
                    <button onClick={handlePrint} className="btn-primary text-xs flex items-center gap-1">
                        <Printer className="w-3.5 h-3.5" /> Print / Export
                    </button>
                </div>
            </div>

            {/* Print Area Document Body */}
            <div className="print-area space-y-5 panel-card p-6 shadow-sm">
                {/* Formal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                        <div className="text-lg font-semibold text-slate-200 tracking-tight">HRShield Enterprise Audit Report</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{report?.organization}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{report?.scope}</div>
                    </div>
                    <div className="text-right font-mono text-xs text-slate-400 space-y-0.5">
                        <div>REPORT ID: <span className="text-slate-200 font-semibold">{report?.reportId}</span></div>
                        <div>DATE: {new Date(report?.generatedAt).toLocaleDateString()}</div>
                        <div>STATUS: <span className="text-slate-300">VERIFIED</span></div>
                    </div>
                </div>

                {/* Executive Scores Section */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded border border-slate-800 bg-slate-900/60 text-center">
                        <div className="text-[11px] font-medium text-slate-400 uppercase">Privacy Score</div>
                        <div className="text-xl font-semibold text-slate-200 font-mono mt-0.5">{summary.privacyScore}%</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">DPDP / GDPR Compliance</div>
                    </div>

                    <div className="p-3.5 rounded border border-slate-800 bg-slate-900/60 text-center">
                        <div className="text-[11px] font-medium text-slate-400 uppercase">Security Score</div>
                        <div className="text-xl font-semibold text-slate-200 font-mono mt-0.5">{summary.securityScore}%</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">InfoSec & RBAC Posture</div>
                    </div>

                    <div className="p-3.5 rounded border border-slate-800 bg-slate-900/60 text-center">
                        <div className="text-[11px] font-medium text-slate-400 uppercase">Findings & Risks</div>
                        <div className="text-xl font-semibold text-slate-200 font-mono mt-0.5">{summary.openFindingsCount} Open</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{summary.criticalFindingsCount} Critical</div>
                    </div>
                </div>

                {/* Audit Scope & Methodology */}
                <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2 text-xs">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">1. Audit Scope & Methodology</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{report?.methodologyNote}</p>
                    <div className="text-slate-500 pt-2 font-mono">
                        Audited Records: {summary.totalEmployeesAudited} Employees | {summary.totalAuditLogsAnalyzed} Access Telemetry Events
                    </div>
                </div>

                {/* Detailed Findings Summary Table */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">2. Audit Findings & Remediation Summary</h3>
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Finding ID</th>
                                <th>Category</th>
                                <th>Title</th>
                                <th>Severity</th>
                                <th>Assigned Owner</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findings.map((f) => (
                                <tr key={f._id}>
                                    <td className="font-mono text-slate-700 dark:text-slate-300 font-medium">{f.findingId}</td>
                                    <td>{f.category}</td>
                                    <td className="font-medium text-slate-900 dark:text-white">{f.title}</td>
                                    <td>
                                        <RiskBadge level={f.severity} />
                                    </td>
                                    <td>{f.assignedOwner || 'Unassigned'}</td>
                                    <td>{f.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* High & Critical Risk Assessment */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">3. Information Security Risk Assessment</h3>
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Risk ID</th>
                                <th>Title</th>
                                <th>Likelihood / Impact</th>
                                <th>Risk Score</th>
                                <th>Mitigation Strategy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map((r) => (
                                <tr key={r._id}>
                                    <td className="font-mono text-slate-700 dark:text-slate-300 font-medium">{r.riskId}</td>
                                    <td className="font-medium text-slate-900 dark:text-white">{r.title}</td>
                                    <td className="font-mono text-slate-600 dark:text-slate-300">L: {r.likelihood} | I: {r.impact}</td>
                                    <td className="font-bold text-slate-800 dark:text-slate-200 font-mono">{r.riskScore} / 9</td>
                                    <td className="text-slate-600 dark:text-slate-300 max-w-xs">{r.remediation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sign-Off Footer */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <div>AUDIT OFFICER: Marcus Vance (Security Lead)</div>
                    <div>COMPLIANCE SEAL: HRSHIELD-AUDIT-2026-OK</div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

