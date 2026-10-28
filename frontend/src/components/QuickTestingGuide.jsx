import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HelpCircle,
    X,
    ArrowRight,
    Lock,
    FileSearch,
    ShieldAlert,
    BarChart3,
    Download,
    UserCheck,
    CheckCircle2
} from 'lucide-react';

const QuickTestingGuide = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [switchingRole, setSwitchingRole] = useState(false);

    const testSteps = [
        {
            id: 1,
            title: "1. Masked PII & Decryption",
            desc: "See employee salary & SSN masked (••••••••) and test AES-256 decryption.",
            icon: Lock,
            targetUrl: "/employees"
        },
        {
            id: 2,
            title: "2. Automated Audit Scanners",
            desc: "Run real-time privacy & security rule evaluation with instant scores.",
            icon: FileSearch,
            targetUrl: "/privacy-audit"
        },
        {
            id: 3,
            title: "3. Audit Findings & Risks",
            desc: "Track vulnerabilities, assign remediation, and view 3x3 risk matrix.",
            icon: ShieldAlert,
            targetUrl: "/findings"
        },
        {
            id: 4,
            title: "4. Immutable Audit Logs",
            desc: "Verify every access, decryption, and login is recorded with IP & timestamp.",
            icon: Download,
            targetUrl: "/audit-logs"
        }
    ];

    const demoRoles = [
        { name: 'Super Admin', role: 'SUPER_ADMIN', email: 'admin@hrshield.com', pass: 'AdminPassword123!', note: 'Full Governance' },
        { name: 'Security Auditor', role: 'SECURITY_AUDITOR', email: 'auditor@hrshield.com', pass: 'AuditorPassword123!', note: 'Audit & Risks' },
        { name: 'HR Manager', role: 'HR_MANAGER', email: 'hr@hrshield.com', pass: 'ManagerPassword123!', note: 'Employee Ops' },
        { name: 'Employee', role: 'EMPLOYEE', email: 'john@hrshield.com', pass: 'EmployeePassword123!', note: 'Self Consent' }
    ];

    const handleSwitchRole = async (email, pass) => {
        setSwitchingRole(true);
        try {
            await login(email, pass);
        } catch (err) {
            console.error('Role switch error:', err);
        } finally {
            setSwitchingRole(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 z-40 px-3 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-slate-900/50"
                title="Project Testing Guide"
            >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Project Demo Guide</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-4 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                        <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-100 text-xs">How to Run & Test HRShield</h4>
                        <p className="text-[10px] text-slate-400">4-Step Guided Evaluation Flow</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Step-by-Step Links */}
            <div className="space-y-1.5">
                {testSteps.map((s) => {
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.id}
                            onClick={() => {
                                navigate(s.targetUrl);
                                setIsOpen(false);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-200 shrink-0">
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-200 text-xs">{s.title}</div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">{s.desc}</div>
                                </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
                        </button>
                    );
                })}
            </div>

            {/* Quick Role Persona Switcher */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                        Test Role Personas:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                        Active: {user?.role || 'NONE'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    {demoRoles.map((r) => {
                        const isCurrent = user?.email === r.email;
                        return (
                            <button
                                key={r.email}
                                disabled={isCurrent || switchingRole}
                                onClick={() => handleSwitchRole(r.email, r.pass)}
                                className={`p-1.5 rounded border text-left transition cursor-pointer text-[11px] ${
                                    isCurrent
                                        ? 'bg-slate-800/90 border-slate-600 text-slate-200'
                                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <div className="font-medium truncate flex items-center gap-1">
                                    {isCurrent && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                                    <span>{r.name}</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">{r.note}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuickTestingGuide;
