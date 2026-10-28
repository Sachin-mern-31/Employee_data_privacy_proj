import React, { useState, useEffect } from 'react';
import { getFindingsApi, updateFindingRemediationApi } from '../services/api';
import { ShieldAlert, Filter, Search, CheckCircle2, Clock, User, X, FileText, ChevronRight } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const AuditFindings = () => {
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Modal state for Remediation tracking
    const [selectedFinding, setSelectedFinding] = useState(null);
    const [remediationForm, setRemediationForm] = useState({
        status: 'INVESTIGATING',
        assignedOwner: '',
        dueDate: '',
        remediationNotes: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchFindings = async () => {
        setLoading(true);
        try {
            const res = await getFindingsApi({
                search,
                severity: severityFilter,
                status: statusFilter,
                category: categoryFilter
            });
            setFindings(res.data || []);
        } catch (error) {
            console.error('Error loading findings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFindings();
    }, [search, severityFilter, statusFilter, categoryFilter]);

    const handleOpenModal = (finding) => {
        setSelectedFinding(finding);
        setRemediationForm({
            status: finding.status || 'INVESTIGATING',
            assignedOwner: finding.assignedOwner || '',
            dueDate: finding.dueDate ? finding.dueDate.substring(0, 10) : '',
            remediationNotes: finding.remediationNotes || ''
        });
    };

    const handleSaveRemediation = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateFindingRemediationApi(selectedFinding._id, remediationForm);
            setSelectedFinding(null);
            fetchFindings();
        } catch (error) {
            console.error('Failed to update remediation:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-base font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-slate-400" /> Audit Findings & Remediation
                    </h1>
                    <p className="text-xs text-slate-400">
                        Vulnerability management, remediation tracking, and verification
                    </p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="panel-card p-3.5 flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search findings by ID, title, or asset..."
                        className="input-field pl-8 text-xs"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="input-field text-xs min-w-[120px]"
                    >
                        <option value="">All Severities</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field text-xs min-w-[130px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="REMEDIATION_IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="RISK_ACCEPTED">RISK ACCEPTED</option>
                    </select>
                </div>
            </div>

            {/* Findings Table */}
            <div className="panel-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Finding ID</th>
                                <th>Title & Category</th>
                                <th>Severity</th>
                                <th>Affected Asset</th>
                                <th>Assigned Owner</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findings.length > 0 ? (
                                findings.map((f) => (
                                    <tr key={f._id}>
                                        <td className="font-mono text-slate-400 font-medium">{f.findingId}</td>
                                        <td>
                                            <div className="font-medium text-slate-200">{f.title}</div>
                                            <div className="text-[11px] text-slate-500">{f.category}</div>
                                        </td>
                                        <td>
                                            <RiskBadge level={f.severity} />
                                        </td>
                                        <td className="font-mono text-slate-400">{f.affectedResource}</td>
                                        <td className="text-slate-300">{f.assignedOwner || 'Unassigned'}</td>
                                        <td>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                                f.status === 'RESOLVED' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                                                f.status === 'REMEDIATION_IN_PROGRESS' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                                                f.status === 'INVESTIGATING' ? 'bg-amber-950/30 text-amber-300 border-amber-900/40' : 'bg-red-950/30 text-rose-300 border-red-900/40'
                                            }`}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => handleOpenModal(f)}
                                                className="btn-secondary text-[11px] py-0.5 px-2"
                                            >
                                                Remediate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">
                                        {loading ? 'Loading findings repository...' : 'No audit findings match selected filters.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Remediation Modal */}
            {selectedFinding && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="panel-card w-full max-w-2xl p-6 space-y-5 shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Remediation Workflow — {selectedFinding.findingId}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedFinding.title}</p>
                            </div>
                            <button onClick={() => setSelectedFinding(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                            <div className="font-semibold text-slate-900 dark:text-slate-200">Audit Finding Description:</div>
                            <p className="text-slate-600 dark:text-slate-400">{selectedFinding.description}</p>
                            <div className="font-semibold text-slate-900 dark:text-slate-200 mt-2">Recommendation:</div>
                            <p className="text-slate-600 dark:text-slate-400">{selectedFinding.recommendation}</p>
                        </div>

                        <form onSubmit={handleSaveRemediation} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Remediation Status</label>
                                    <select
                                        value={remediationForm.status}
                                        onChange={(e) => setRemediationForm({ ...remediationForm, status: e.target.value })}
                                        className="input-field font-medium"
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="INVESTIGATING">INVESTIGATING</option>
                                        <option value="REMEDIATION_IN_PROGRESS">REMEDIATION_IN_PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED (Verified)</option>
                                        <option value="RISK_ACCEPTED">RISK_ACCEPTED</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Owner</label>
                                    <input
                                        type="text"
                                        value={remediationForm.assignedOwner}
                                        onChange={(e) => setRemediationForm({ ...remediationForm, assignedOwner: e.target.value })}
                                        placeholder="e.g. Marcus Vance (Security Lead)"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Remediation Notes / Evidence</label>
                                <textarea
                                    rows={3}
                                    value={remediationForm.remediationNotes}
                                    onChange={(e) => setRemediationForm({ ...remediationForm, remediationNotes: e.target.value })}
                                    placeholder="Enter remediation steps taken, patches applied, or justification..."
                                    className="input-field"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setSelectedFinding(null)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? 'Updating...' : 'Update Remediation State'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditFindings;
