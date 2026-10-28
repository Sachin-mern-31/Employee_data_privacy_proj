import React, { useState, useEffect } from 'react';
import { getRisksApi, createRiskApi, updateRiskApi } from '../services/api';
import { AlertOctagon, Plus, RefreshCw, X, ShieldAlert } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const RiskManagement = () => {
    const [risksData, setRisksData] = useState({ risks: [], matrixMap: {} });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [form, setForm] = useState({
        riskId: `RSK-00${Math.floor(Math.random() * 900) + 100}`,
        title: '',
        category: 'Data Protection',
        description: '',
        likelihood: 'MEDIUM',
        impact: 'HIGH',
        affectedAsset: '',
        owner: 'Security Governance',
        remediation: ''
    });

    const fetchRisks = async () => {
        setLoading(true);
        try {
            const res = await getRisksApi();
            setRisksData(res.data);
        } catch (error) {
            console.error('Error fetching risks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRisks();
    }, []);

    const handleCreateRisk = async (e) => {
        e.preventDefault();
        try {
            await createRiskApi(form);
            setShowCreateModal(false);
            setForm({
                riskId: `RSK-00${Math.floor(Math.random() * 900) + 100}`,
                title: '',
                category: 'Data Protection',
                description: '',
                likelihood: 'MEDIUM',
                impact: 'HIGH',
                affectedAsset: '',
                owner: 'Security Governance',
                remediation: ''
            });
            fetchRisks();
        } catch (error) {
            console.error('Create risk failed:', error);
        }
    };

    const risks = risksData.risks || [];
    const map = risksData.matrixMap || {};

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-base font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-slate-400" /> Risk Management & Assessment
                    </h1>
                    <p className="text-xs text-slate-400">
                        Likelihood x Impact evaluation matrix and risk register
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchRisks} className="btn-secondary text-xs flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary text-xs flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Risk
                    </button>
                </div>
            </div>

            {/* 3x3 Likelihood x Impact Risk Matrix Visualization */}
            <div className="panel-card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> 3x3 Risk Assessment Matrix
                </h3>

                <div className="overflow-x-auto">
                    <div className="min-w-[500px] grid grid-cols-4 gap-1.5 text-center text-xs font-medium">
                        {/* Row Header 1 */}
                        <div className="p-2 text-slate-500 uppercase flex items-center justify-center font-medium text-[11px]">Likelihood \ Impact</div>
                        <div className="p-2 bg-slate-900 text-slate-400 rounded text-[11px]">LOW (1)</div>
                        <div className="p-2 bg-slate-900 text-slate-400 rounded text-[11px]">MEDIUM (2)</div>
                        <div className="p-2 bg-slate-900 text-slate-400 rounded text-[11px]">HIGH (3)</div>

                        {/* HIGH Likelihood Row */}
                        <div className="p-2 bg-slate-900 text-slate-400 rounded flex items-center justify-center text-[11px]">HIGH (3)</div>
                        <div className="p-3 rounded border bg-[#232019] text-[#cbb689] border-[#332e22] flex flex-col justify-center">
                            <span className="text-[11px]">Medium (3)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.HIG_LOW || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#261d1e] text-[#d29b9e] border-[#39282a] flex flex-col justify-center">
                            <span className="text-[11px]">High (6)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.HIG_MED || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#2c1d20] text-[#da989d] border-[#44272c] flex flex-col justify-center">
                            <span className="text-[11px] font-semibold">Critical (9)</span>
                            <span className="text-base font-semibold text-slate-100 mt-0.5">{map.HIG_HIG || 0}</span>
                        </div>

                        {/* MEDIUM Likelihood Row */}
                        <div className="p-2 bg-slate-900 text-slate-400 rounded flex items-center justify-center text-[11px]">MEDIUM (2)</div>
                        <div className="p-3 rounded border bg-[#17221c] text-[#93bfa6] border-[#203127] flex flex-col justify-center">
                            <span className="text-[11px]">Low (2)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.MED_LOW || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#232019] text-[#cbb689] border-[#332e22] flex flex-col justify-center">
                            <span className="text-[11px]">Medium (4)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.MED_MED || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#261d1e] text-[#d29b9e] border-[#39282a] flex flex-col justify-center">
                            <span className="text-[11px]">High (6)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.MED_HIG || 0}</span>
                        </div>

                        {/* LOW Likelihood Row */}
                        <div className="p-2 bg-slate-900 text-slate-400 rounded flex items-center justify-center text-[11px]">LOW (1)</div>
                        <div className="p-3 rounded border bg-[#17221c] text-[#93bfa6] border-[#203127] flex flex-col justify-center">
                            <span className="text-[11px]">Low (1)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.LOW_LOW || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#17221c] text-[#93bfa6] border-[#203127] flex flex-col justify-center">
                            <span className="text-[11px]">Low (2)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.LOW_MED || 0}</span>
                        </div>
                        <div className="p-3 rounded border bg-[#232019] text-[#cbb689] border-[#332e22] flex flex-col justify-center">
                            <span className="text-[11px]">Medium (3)</span>
                            <span className="text-base font-semibold text-slate-200 mt-0.5">{map.LOW_HIG || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Register Table */}
            <div className="panel-card overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase">
                    Risk Register Repository ({risks.length} Risks Tracked)
                </div>

                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Risk ID</th>
                                <th>Title & Category</th>
                                <th>Likelihood / Impact</th>
                                <th>Risk Score</th>
                                <th>Severity</th>
                                <th>Affected Asset</th>
                                <th>Owner</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.length > 0 ? (
                                risks.map((r) => (
                                    <tr key={r._id}>
                                        <td className="font-mono text-slate-700 dark:text-slate-300 font-medium">{r.riskId}</td>
                                        <td>
                                            <div className="font-medium text-slate-900 dark:text-white">{r.title}</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.category}</div>
                                        </td>
                                        <td className="font-mono text-slate-600 dark:text-slate-300">L: {r.likelihood} | I: {r.impact}</td>
                                        <td className="font-bold text-slate-800 dark:text-slate-200 font-mono">{r.riskScore} / 9</td>
                                        <td>
                                            <RiskBadge level={r.severity} />
                                        </td>
                                        <td className="font-mono text-slate-500 dark:text-slate-400">{r.affectedAsset}</td>
                                        <td className="text-slate-700 dark:text-slate-300">{r.owner}</td>
                                        <td>
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px] border border-slate-200 dark:border-slate-700">
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center text-slate-500 py-8">
                                        {loading ? 'Fetching risk register...' : 'No risk items registered.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Risk Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="panel-card w-full max-w-xl p-6 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-4 h-4 text-slate-700 dark:text-slate-300" /> Register New Risk Item
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Risk ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.riskId}
                                        onChange={(e) => setForm({ ...form, riskId: e.target.value })}
                                        className="input-field font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="Data Protection">Data Protection</option>
                                        <option value="Privacy">Privacy</option>
                                        <option value="Access Control">Access Control</option>
                                        <option value="Authentication">Authentication</option>
                                        <option value="Account Management">Account Management</option>
                                        <option value="Data Retention">Data Retention</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Risk Title</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Insecure PII Export to Third-Party"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Likelihood</label>
                                    <select
                                        value={form.likelihood}
                                        onChange={(e) => setForm({ ...form, likelihood: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="LOW">LOW (1)</option>
                                        <option value="MEDIUM">MEDIUM (2)</option>
                                        <option value="HIGH">HIGH (3)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Impact</label>
                                    <select
                                        value={form.impact}
                                        onChange={(e) => setForm({ ...form, impact: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="LOW">LOW (1)</option>
                                        <option value="MEDIUM">MEDIUM (2)</option>
                                        <option value="HIGH">HIGH (3)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Affected Asset</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.affectedAsset}
                                        onChange={(e) => setForm({ ...form, affectedAsset: e.target.value })}
                                        placeholder="e.g. Employee MongoDB Database"
                                        className="input-field font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Risk Owner</label>
                                    <input
                                        type="text"
                                        value={form.owner}
                                        onChange={(e) => setForm({ ...form, owner: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Proposed Remediation Strategy</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={form.remediation}
                                    onChange={(e) => setForm({ ...form, remediation: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Risk Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskManagement;

