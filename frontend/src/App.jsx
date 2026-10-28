import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import UsersPage from './pages/Users';
import AccessControl from './pages/AccessControl';
import PrivacyAudit from './pages/PrivacyAudit';
import SecurityAudit from './pages/SecurityAudit';
import AuditFindings from './pages/AuditFindings';
import RiskManagement from './pages/RiskManagement';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import SecurityAlertsPage from './pages/SecurityAlerts';
import SettingsPage from './pages/Settings';
import ConsentSettings from './pages/ConsentSettings';

const ALL_GOVERNANCE_ROLES = ['SUPER_ADMIN', 'SECURITY_AUDITOR', 'HR_MANAGER', 'HR_STAFF'];

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f141c] flex items-center justify-center text-slate-400 font-mono text-xs">
                Verifying HRShield Governance Session...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'EMPLOYEE') {
            return <Navigate to="/consents" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0f141c]">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-y-auto max-h-[calc(100vh-57px)]">
                    {children}
                </main>
            </div>
        </div>
    );
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to={user.role === 'EMPLOYEE' ? '/consents' : '/dashboard'} replace />}
            />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Employees */}
            <Route
                path="/employees"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <EmployeeList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/employees/:id"
                element={
                    <ProtectedRoute allowedRoles={[...ALL_GOVERNANCE_ROLES, 'EMPLOYEE']}>
                        <EmployeeDetail />
                    </ProtectedRoute>
                }
            />

            {/* Users & Roles */}
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SECURITY_AUDITOR']}>
                        <UsersPage />
                    </ProtectedRoute>
                }
            />

            {/* Access Control (RBAC Matrix) */}
            <Route
                path="/access-control"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <AccessControl />
                    </ProtectedRoute>
                }
            />

            {/* Privacy Audit */}
            <Route
                path="/privacy-audit"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <PrivacyAudit />
                    </ProtectedRoute>
                }
            />

            {/* Security Audit */}
            <Route
                path="/security-audit"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <SecurityAudit />
                    </ProtectedRoute>
                }
            />

            {/* Audit Findings */}
            <Route
                path="/findings"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <AuditFindings />
                    </ProtectedRoute>
                }
            />

            {/* Risk Management */}
            <Route
                path="/risks"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <RiskManagement />
                    </ProtectedRoute>
                }
            />

            {/* Activity Logs */}
            <Route
                path="/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <AuditLogs />
                    </ProtectedRoute>
                }
            />

            {/* Reports */}
            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            {/* Notifications / Alerts */}
            <Route
                path="/alerts"
                element={
                    <ProtectedRoute allowedRoles={[...ALL_GOVERNANCE_ROLES, 'EMPLOYEE']}>
                        <SecurityAlertsPage />
                    </ProtectedRoute>
                }
            />

            {/* Settings */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute allowedRoles={ALL_GOVERNANCE_ROLES}>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />

            {/* Profile & Consent Settings */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={[...ALL_GOVERNANCE_ROLES, 'EMPLOYEE']}>
                        <ConsentSettings />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/consents"
                element={
                    <ProtectedRoute allowedRoles={[...ALL_GOVERNANCE_ROLES, 'EMPLOYEE']}>
                        <ConsentSettings />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}