import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployeesApi, createEmployeeApi, exportEmployeesDataApi, deleteEmployeeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SensitivityBadge from '../components/SensitivityBadge';
import {
    Search,
    Filter,
    Plus,
    Download,
    Eye,
    Trash2,
    Lock,
    X,
    CheckCircle,
    Building,
    UserCheck,
    AlertCircle
} from 'lucide-react';

import PageHeaderGuide from '../components/PageHeaderGuide';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [exportResult, setExportResult] = useState(null);
    const [formError, setFormError] = useState('');

    const { isHRManager, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        employeeId: `EMP00${Math.floor(Math.random() * 900) + 100}`,
        name: '',
        email: '',
        department: 'Engineering',
        designation: '',
        phone: '',
        salary: '',
        ssn: '',
        bankDetails: '',
        healthInfo: '',
        address: '',
        emergencyContact: ''
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployeesApi({
                search,
                department: departmentFilter,
                status: statusFilter
            });
            setEmployees(res.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [search, departmentFilter, statusFilter]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            await createEmployeeApi(formData);
            setShowModal(false);
            setFormData({
                employeeId: `EMP00${Math.floor(Math.random() * 900) + 100}`,
                name: '',
                email: '',
                department: 'Engineering',
                designation: '',
                phone: '',
                salary: '',
                ssn: '',
                bankDetails: '',
                healthInfo: '',
                address: '',
                emergencyContact: ''
            });
            fetchEmployees();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error creating employee record.');
        }
    };

    const handleExport = async () => {
        try {
            const res = await exportEmployeesDataApi('PAYROLL_VENDOR_SHARING');
            setExportResult(res.data);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleDelete = async (id, empId) => {
        if (window.confirm(`Are you sure you want to delete employee record ${empId}? This action will be audited.`)) {
            try {
                await deleteEmployeeApi(id);
                fetchEmployees();
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    return (
        <div className="p-5 sm:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Page Header Guide */}
            <PageHeaderGuide
                title="Employee Registry & Protected PII"
                subtitle="Field-level AES-256 encrypted records with masked PII and explicit decryption auditing"
                icon={Building}
                techBadge="AES-256 Masking"
                purpose="In compliance with DPDP and cybersecurity standards, sensitive fields like SSN, Bank Accounts, and Compensation must be masked (••••••••) and encrypted. Clicking on any employee lets you inspect their record and test role-based decryption."
                testSteps={[
                    "Click on any employee row below (e.g. Rahul Sharma or Priya Patel)",
                    "Observe the masked •••••••• fields in their profile",
                    "Click 'Reveal PII' to test secure AES-256 decryption"
                ]}
                nextStepText="View Audit Logs"
                nextStepUrl="/audit-logs"
                actions={
                    <div className="flex items-center gap-2">
                        {isHRManager && (
                            <button onClick={handleExport} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
                                <Download className="w-3.5 h-3.5" />
                                <span>Export Data</span>
                            </button>
                        )}
                        {isHRManager && (
                            <button onClick={() => setShowModal(true)} className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer">
                                <Plus className="w-3.5 h-3.5" />
                                <span>New Employee</span>
                            </button>
                        )}
                    </div>
                }
            />

            {/* Consent-Checked Export Modal/Banner */}
            {exportResult && (
                <div className="panel-card p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-400" /> Export Generated ({exportResult.exportPurpose})
                        </div>
                        <button onClick={() => setExportResult(null)} className="text-slate-400 hover:text-white cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-0.5">
                        <div>Total Records: <span className="font-mono text-slate-200">{exportResult.totalRecords}</span></div>
                        <div>Redacted (Consent Revoked): <span className="font-mono text-slate-300">{exportResult.recordsWithRevokedConsent}</span></div>
                    </div>

                    <div className="pt-1">
                        <textarea
                            readOnly
                            rows={3}
                            className="input-field font-mono text-[11px]"
                            value={JSON.stringify(exportResult.data, null, 2)}
                        />
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="panel-card p-3.5 flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, name, email..."
                        className="input-field !pl-8 text-xs"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="input-field text-xs min-w-[130px]"
                    >
                        <option value="">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                        <option value="Infrastructure">Infrastructure</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field text-xs min-w-[110px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="TERMINATED">TERMINATED</option>
                    </select>
                </div>
            </div>

            {/* Employees Table */}
            <div className="panel-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="custom-table text-xs">
                        <thead>
                            <tr>
                                <th>Emp ID</th>
                                <th>Name & Email</th>
                                <th>Department</th>
                                <th>Classification</th>
                                <th>Restricted PII</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((emp) => (
                                    <tr key={emp._id}>
                                        <td className="font-mono text-slate-400 font-medium">{emp.employeeId}</td>
                                        <td>
                                            <div className="font-medium text-slate-200">{emp.name}</div>
                                            <div className="text-[11px] text-slate-500">{emp.email}</div>
                                        </td>
                                        <td>
                                            <div className="text-slate-300">{emp.designation}</div>
                                            <div className="text-[11px] text-slate-500">{emp.department}</div>
                                        </td>
                                        <td>
                                            <SensitivityBadge level="Restricted" />
                                        </td>
                                        <td className="font-mono text-slate-400 text-[11px]">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Lock className="w-3 h-3 text-slate-500" />
                                                <span>Salary: {emp.salary || '••••••••'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                                    emp.status === 'ACTIVE'
                                                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                                                        : 'bg-red-950/30 text-rose-300 border-red-900/40'
                                                }`}
                                            >
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="text-right space-x-1.5">
                                            <button
                                                onClick={() => navigate(`/employees/${emp._id}`)}
                                                className="btn-secondary text-[11px] py-0.5 px-2"
                                            >
                                                <Eye className="w-3 h-3 text-slate-400" /> View
                                            </button>

                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDelete(emp._id, emp.employeeId)}
                                                    className="btn-danger text-[11px] py-0.5 px-1.5"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">
                                        {loading ? 'Fetching employee registry...' : 'No employee records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="panel-card w-full max-w-2xl p-6 space-y-4 border-slate-700">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-400" /> Add New Employee Record
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Employee ID</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        required
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        className="input-field font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Alice Smith"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="alice@hrshield.com"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Human Resources">Human Resources</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Design">Design</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        required
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Encrypted Restricted Fields Header */}
                            <div className="pt-2 border-t border-slate-700">
                                <div className="text-slate-200 font-semibold text-xs flex items-center gap-1.5 mb-2">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Restricted Sensitive Fields (AES-256 Encrypted)
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 mb-1">SSN / Tax ID</label>
                                        <input
                                            type="text"
                                            name="ssn"
                                            value={formData.ssn}
                                            onChange={handleInputChange}
                                            placeholder="987-65-4321"
                                            className="input-field font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-1">Annual Salary</label>
                                        <input
                                            type="text"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleInputChange}
                                            placeholder="$125,000 / year"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-1">Bank Account</label>
                                        <input
                                            type="text"
                                            name="bankDetails"
                                            value={formData.bankDetails}
                                            onChange={handleInputChange}
                                            placeholder="Bank Acct: 998877"
                                            className="input-field font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-1">Health Disclosure</label>
                                        <input
                                            type="text"
                                            name="healthInfo"
                                            value={formData.healthInfo}
                                            onChange={handleInputChange}
                                            placeholder="Blood Type: O+"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save & Encrypt Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
