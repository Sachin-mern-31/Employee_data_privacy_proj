import React, { useState, useEffect } from 'react';
import { getPrivacyAuditApi, runPrivacyScanApi } from '../services/api';
import { Eye, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck, Database, FileText } from 'lucide-react';

const PrivacyAudit = () => {
    const [privacyData, setPrivacyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    const fetchPrivacyAudit = async () => {
        setLoading(true);
        try {
            const res = await getPrivacyAuditApi();
            setPrivacyData(res.data);
        } catch (error) {
            console.error('Error fetching privacy audit:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrivacyAudit();
    }, []);

    const handleRunPrivacyScan = async () => {
        setScanning(true);
        try {
            await runPrivacyScanApi();
            fetchPrivacyAudit();
        } catch (error) {
            console.error('Privacy scan error:', error);
        } finally {
            setScanning(false);
        }
    };

    if (loading && !privacyData) {
        return (
            <div className="p-8 text-center text-slate-400">
                Running automated Privacy Audit evaluation...
            </div>
        );
    }

    const checks = privacyData?.checks || [];
    const summary = privacyData?.summary || {};
    const findings = privacyData?.findings || [];
    const score = privacyData?.privacyScore || 85;

    return (
        <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-base font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" /> Data Privacy Audit (DPDP / GDPR)
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Automated privacy compliance checks for PII exposure, consent, and retention rules
                    </p>
                </div>

                <button
                    onClick={handleRunPrivacyScan}
                    disabled={scanning}
                    className="btn-primary text-xs"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                    {scanning ? 'Scanning...' : 'Run Privacy Scan'}
                </button>
            </div>

            {/* Score & Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="panel-card p-3.5">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Overall Privacy Score</div>
                    <div className="text-xl font-semibold text-slate-200 font-mono mt-0.5">{score}%</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{summary.totalChecks || 4} Rules Evaluated</div>
                </div>

                <div className="panel-card p-3.5">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Passed Checks</div>
                    <div className="text-xl font-semibold text-slate-300 font-mono mt-0.5">{summary.passed || 0}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Compliant</div>
                </div>

                <div className="panel-card p-3.5">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Warnings</div>
                    <div className="text-xl font-semibold text-slate-300 font-mono mt-0.5">{summary.warnings || 0}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Review suggested</div>
                </div>

                <div className="panel-card p-3.5">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Failed Checks</div>
                    <div className="text-xl font-semibold text-slate-300 font-mono mt-0.5">{summary.failed || 0}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Action needed</div>
                </div>
            </div>

            {/* Automated Privacy Checks List */}
            <div className="panel-card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Automated Privacy Rule Evaluation
                </h3>

                <div className="space-y-2">
                    {checks.map((chk, idx) => (
                        <div
                            key={idx}
                            className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1"
                        >
                            <div className="flex items-center justify-between text-xs text-slate-200">
                                <div className="flex items-center gap-2 font-medium">
                                    <span className="font-mono text-slate-500">[{chk.ruleId}]</span>
                                    <span>{chk.title}</span>
                                </div>
                                <span
                                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${
                                        chk.status === 'PASSED'
                                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                                            : chk.status === 'WARNING'
                                            ? 'bg-amber-950/30 text-amber-300 border-amber-900/40'
                                            : 'bg-red-950/30 text-rose-300 border-red-900/40'
                                    }`}
                                >
                                    {chk.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">{chk.details}</p>
                            <div className="text-[10px] text-slate-500 flex items-center gap-3 font-mono">
                                <span>Category: {chk.category}</span>
                                <span>Severity: {chk.severity}</span>
                                <span>Affected: {chk.affectedCount || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Privacy Audit Findings List */}
            <div className="panel-card p-5 space-y-3 border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Active Privacy Findings ({findings.length})
                </h3>

                <div className="space-y-2.5">
                    {findings.length > 0 ? (
                        findings.map((f) => (
                            <div key={f._id} className="p-3.5 rounded bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-100 text-xs">{f.title}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        f.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' :
                                        f.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                        {f.severity}
                                    </span>
                                </div>
                                <p className="text-slate-300">{f.description}</p>
                                <div className="p-2 rounded bg-slate-800/80 text-[11px]">
                                    <span className="font-semibold text-slate-300">Remediation: </span>
                                    <span className="text-slate-300">{f.recommendation}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-6">No active privacy findings detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivacyAudit;
