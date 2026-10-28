import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeByIdApi, getAuditLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SensitivityBadge from '../components/SensitivityBadge';
import PageHeaderGuide from '../components/PageHeaderGuide';
import {
    Shield,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Building,
    Award,
    CreditCard,
    HeartPulse,
    CheckCircle,
    ShieldAlert,
    UserCheck,
    Clock,
    Activity,
    AlertTriangle
} from 'lucide-react';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [employee, setEmployee] = useState(null);
    const [isDecryptedView, setIsDecryptedView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [auditFeedback, setAuditFeedback] = useState(null);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
    const [employeeAccessLogs, setEmployeeAccessLogs] = useState([]);

    const fetchEmployeeDetail = async (revealSensitive = false) => {
        setLoading(true);
        try {
            const res = await getEmployeeByIdApi(id, revealSensitive);
            setEmployee(res.data);
            setIsDecryptedView(revealSensitive);

            if (revealSensitive) {
                setAuditFeedback(
                    `Restricted Data Decrypted! An automated telemetry log entry was registered for ${user?.email}.`
                );
            } else {
                setAuditFeedback(null);
            }
        } catch (error) {
            console.error('Error loading employee detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccessLogs = async () => {
        if (!employee) return;
        try {
            const res = await getAuditLogsApi({ search: employee.employeeId });
            setEmployeeAccessLogs(res.data || []);
        } catch (error) {
            console.error('Error fetching employee access telemetry:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeDetail(false);
    }, [id]);

    useEffect(() => {
        if (employee) {
            fetchAccessLogs();
        }
    }, [employee]);

    const toggleDecryption = () => {
        fetchEmployeeDetail(!isDecryptedView);
    };

    if (loading && !employee) {
        return (
            <div className="p-8 text-center text-slate-400">
                Loading employee security profile...
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8 text-center text-rose-400 space-y-4">
                <AlertTriangle className="w-8 h-8 mx-auto" />
                <p>Employee record not found or access restricted.</p>
                <button onClick={() => navigate('/employees')} className="btn-secondary text-xs">
                    Return to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="p-5 sm:p-6 space-y-4 max-w-5xl mx-auto">
            {/* Top Navigation & Guide */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
                </button>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-900/80 p-0.5 rounded-md border border-slate-800 text-xs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                                activeTab === 'profile' ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700/60' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'security' ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700/60' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <ShieldAlert className="w-3.5 h-3.5" /> Security & Audit
                        </button>
                    </div>

                    <button
                        onClick={toggleDecryption}
                        className={`text-xs py-1.5 px-3 rounded-md transition font-medium flex items-center gap-1.5 cursor-pointer ${
                            isDecryptedView
                                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
                                : 'btn-primary'
                        }`}
                    >
                        {isDecryptedView ? (
                            <>
                                <EyeOff className="w-3.5 h-3.5" /> Mask PII
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5" /> Reveal Restricted PII
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Feature Guide */}
            <PageHeaderGuide
                title={`Employee Security Record: ${employee.name}`}
                subtitle={`Employee ID: ${employee.employeeId} · Department: ${employee.department} · AES-256 Protected`}
                icon={Shield}
                techBadge={isDecryptedView ? "AES-256 Decrypted" : "AES-256 Masked (••••••••)"}
                purpose="Sensitive data fields (Compensation, SSN/Aadhar, Bank Details) are encrypted at rest with AES-256-CBC. Viewing raw values requires role authorization. Every decryption action is monitored and written to the audit telemetry database."
                testSteps={[
                    "Click 'Reveal Restricted PII' above to decrypt sensitive data",
                    "Observe the green audit confirmation banner appear below",
                    "Click 'Verify in Activity Logs' to inspect the recorded telemetry event"
                ]}
                nextStepText="Verify in Activity Logs"
                nextStepUrl="/audit-logs"
            />

            {/* Audit Log Feedback Banner */}
            {auditFeedback && (
                <div className="p-2.5 rounded-md border border-slate-800 bg-slate-900/60 text-slate-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{auditFeedback}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                        LOGGED
                    </span>
                </div>
            )}

            {/* Header Profile Summary */}
            <div className="panel-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-lg">
                        {employee.name ? employee.name.charAt(0) : 'E'}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-semibold text-slate-200 tracking-tight">{employee.name}</h1>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                {employee.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{employee.designation} • {employee.department}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs">
                    <SensitivityBadge level="Restricted" />
                    <span className="text-[11px] text-slate-500 font-mono">
                        {employee.employeeId}
                    </span>
                </div>
            </div>

            {/* TAB 1: Main Employee Profile */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Basic & Employment Information */}
                    <div className="panel-card p-5 space-y-3 border-slate-800">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Building className="w-4 h-4 text-slate-400" /> Basic & Employment Details
                            </h3>
                            <SensitivityBadge level="Internal" />
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Employee ID</span>
                                <span className="font-mono text-slate-200 font-semibold">{employee.employeeId}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Department</span>
                                <span className="text-slate-200">{employee.department}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Designation</span>
                                <span className="text-slate-200">{employee.designation}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Work Phone</span>
                                <span className="text-slate-200">{employee.phone || 'N/A'}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Manager</span>
                                <span className="text-slate-200">{employee.managerName || 'HR Operations Manager'}</span>
                            </div>

                            <div className="flex justify-between py-1">
                                <span className="text-slate-400 font-medium">Joining Date</span>
                                <span className="font-mono text-slate-400">
                                    {new Date(employee.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Confidential Personal Info */}
                    <div className="panel-card p-5 space-y-3 border-slate-800">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4 text-slate-400" /> Confidential Contact Information
                            </h3>
                            <SensitivityBadge level="Confidential" />
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Residential Address</span>
                                <span className="text-slate-200">{employee.address || 'Confidential / On File'}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400 font-medium">Emergency Contact</span>
                                <span className="text-slate-200">{employee.emergencyContact || 'Confidential / On File'}</span>
                            </div>

                            <div className="flex justify-between py-1">
                                <span className="text-slate-400 font-medium">Performance Assessment</span>
                                <span className="text-slate-200 font-semibold">{employee.performanceRating || 'Exceeds Expectations'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sensitive Information Panel (Masked by Default) */}
                    <div className="panel-card p-5 space-y-3 md:col-span-2 border-slate-800">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div>
                                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" /> Sensitive Information (AES-256 Encrypted)
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Sensitive PII values are masked by default. Decrypting PII logs an immutable audit event.
                                </p>
                            </div>
                            <SensitivityBadge level="Restricted" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-slate-400" /> SSN / Tax Identifier
                                </div>
                                <div className="font-mono text-xs font-semibold text-slate-200">
                                    {isDecryptedView ? <span className="text-emerald-400">{employee.ssn}</span> : <span className="text-slate-400">XXXX XXXX 4582</span>}
                                </div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Annual Salary / Compensation
                                </div>
                                <div className="font-mono text-xs font-semibold text-slate-200">
                                    {isDecryptedView ? <span className="text-emerald-400">{employee.salary}</span> : <span className="text-slate-400">$XXXXXX / year</span>}
                                </div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Bank Account
                                </div>
                                <div className="font-mono text-xs font-semibold text-slate-200">
                                    {isDecryptedView ? <span className="text-emerald-400">{employee.bankDetails}</span> : <span className="text-slate-400">XXXX XXXX 4582</span>}
                                </div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                                    <HeartPulse className="w-3.5 h-3.5 text-slate-400" /> Medical / Health Disclosure
                                </div>
                                <div className="font-mono text-xs font-semibold text-slate-200">
                                    {isDecryptedView ? <span className="text-emerald-400">{employee.healthInfo}</span> : <span className="text-slate-400">Protected Health Record</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Employee Security Profile */}
            {activeTab === 'security' && (
                <div className="space-y-5">
                    {/* Data Classification Matrix Card */}
                    <div className="panel-card p-5 space-y-3 border-slate-800">
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-400" /> Employee Data Classification Matrix
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                <div className="font-bold text-slate-300 uppercase text-[10px]">Public</div>
                                <div className="font-semibold text-slate-200 mt-1">Name, Email, Job Title</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Accessible by internal users</div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                <div className="font-bold text-blue-400 uppercase text-[10px]">Internal</div>
                                <div className="font-semibold text-slate-200 mt-1">Phone, Department, Manager</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">HR & Management view only</div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                <div className="font-bold text-amber-400 uppercase text-[10px]">Confidential</div>
                                <div className="font-semibold text-slate-200 mt-1">Address, Emergency Contact</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Authorized Officers only</div>
                            </div>

                            <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                <div className="font-bold text-rose-400 uppercase text-[10px]">Restricted</div>
                                <div className="font-semibold text-slate-200 mt-1">SSN, Salary, Bank Account</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">AES-256 Encrypted • Audit Logged</div>
                            </div>
                        </div>
                    </div>

                    {/* Access History Telemetry for this Employee */}
                    <div className="panel-card p-5 space-y-3 border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" /> Recent Access Telemetry Logs for {employee.name}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                                Logs: {employeeAccessLogs.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="custom-table text-xs">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                        <th>Sensitivity</th>
                                        <th>IP Address</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeAccessLogs.length > 0 ? (
                                        employeeAccessLogs.map((log) => (
                                            <tr key={log._id}>
                                                <td className="font-mono text-slate-400">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="font-semibold text-slate-200">{log.userName}</td>
                                                <td>
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                                        {log.userRole}
                                                    </span>
                                                </td>
                                                <td className="font-mono text-slate-300">{log.action}</td>
                                                <td>
                                                    <SensitivityBadge level={log.sensitivityLevel} />
                                                </td>
                                                <td className="font-mono text-slate-400">{log.ipAddress}</td>
                                                <td>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        log.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center text-slate-500 py-6">
                                                No recent access telemetry records found for this employee.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetail;
