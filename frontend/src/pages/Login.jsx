import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, Mail, ArrowRight, Key, AlertCircle, User, UserPlus, LogIn, CheckCircle, Sun, Moon } from 'lucide-react';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const { theme, toggleTheme } = useTheme();
    
    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Sign Up Form State
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpRole, setSignUpRole] = useState('EMPLOYEE');
    const [signUpEmployeeId, setSignUpEmployeeId] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            const user = await login(loginEmail, loginPassword);
            if (user.role === 'EMPLOYEE') {
                navigate('/consents');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
            if (msg.includes('Invalid email or password')) {
                setError('Email or password incorrect. If this is a new account, switch to "Create Account" tab first.');
            } else {
                setError(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            const newUser = await register({
                name: signUpName,
                email: signUpEmail,
                password: signUpPassword,
                role: signUpRole,
                employeeId: signUpEmployeeId || `EMP00${Math.floor(Math.random() * 800) + 100}`
            });

            setSuccessMsg(`Account created for ${newUser.email}! Redirecting...`);
            setTimeout(() => {
                if (newUser.role === 'EMPLOYEE') {
                    navigate('/consents');
                } else {
                    navigate('/dashboard');
                }
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try another email.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickLogin = async (demoEmail, demoPassword) => {
        setLoginEmail(demoEmail);
        setLoginPassword(demoPassword);
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);
        try {
            const user = await login(demoEmail, demoPassword);
            if (user.role === 'EMPLOYEE') {
                navigate('/consents');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Quick login failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f141c] relative overflow-hidden">
            {/* Top Right Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
                title="Toggle Theme Mode"
            >
                {theme === 'dark' ? (
                    <>
                        <Sun className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-300">Light</span>
                    </>
                ) : (
                    <>
                        <Moon className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-slate-700">Dark</span>
                    </>
                )}
            </button>

            <div className="w-full max-w-sm mx-auto space-y-4 relative z-10 my-auto">
                {/* Header Brand */}
                <div className="text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mx-auto">
                        <Shield className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-200 tracking-tight">HRShield</h1>
                        <p className="text-xs text-slate-400">Employee Data Privacy & Security Audit</p>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="panel-card p-5 space-y-4">
                    {/* Mode Toggle Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-md border border-slate-800 text-xs">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                            className={`py-1.5 rounded transition flex items-center justify-center gap-1.5 ${
                                mode === 'login'
                                    ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <LogIn className="w-3.5 h-3.5" /> Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                            className={`py-1.5 rounded transition flex items-center justify-center gap-1.5 ${
                                mode === 'signup'
                                    ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Register
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Sign In Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                            <div className="space-y-1 text-left">
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Work Email
                                </label>
                                <div className="relative flex items-center">
                                    <Mail className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="admin@hrshield.com or your email"
                                        className="input-field !pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 text-left">
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                                    <input
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="input-field !pl-9"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-2.5 text-xs font-semibold mt-1"
                            >
                                {isSubmitting ? 'Authenticating...' : 'Sign In'}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}

                    {/* Sign Up Form */}
                    {mode === 'signup' && (
                        <form onSubmit={handleSignUpSubmit} className="space-y-3 text-left">
                            <div className="space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative flex items-center">
                                    <User className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        value={signUpName}
                                        onChange={(e) => setSignUpName(e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="input-field !pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <Mail className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        value={signUpEmail}
                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                        placeholder="rahul@example.com"
                                        className="input-field !pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Account Password
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="input-field !pl-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                        Assigned Role
                                    </label>
                                    <select
                                        value={signUpRole}
                                        onChange={(e) => setSignUpRole(e.target.value)}
                                        className="input-field text-xs"
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="HR_MANAGER">HR Manager</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                        Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        value={signUpEmployeeId}
                                        onChange={(e) => setSignUpEmployeeId(e.target.value)}
                                        placeholder="EMP007"
                                        className="input-field font-mono text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-2.5 text-xs font-semibold mt-1"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register Account'}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}

                    {/* Quick Demo Login Preset Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Quick Demo Login:</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin@hrshield.com', 'AdminPassword123!')}
                                className="py-1.5 px-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition hover:border-slate-700"
                            >
                                <div className="font-medium text-[11px] text-slate-300">Admin</div>
                                <div className="text-[10px] text-slate-500">Full Access</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('auditor@hrshield.com', 'AuditorPassword123!')}
                                className="py-1.5 px-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition hover:border-slate-700"
                            >
                                <div className="font-medium text-[11px] text-slate-300">Auditor</div>
                                <div className="text-[10px] text-slate-500">Audit & Risk</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('hr@hrshield.com', 'ManagerPassword123!')}
                                className="py-1.5 px-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition hover:border-slate-700"
                            >
                                <div className="font-medium text-[11px] text-slate-300">HR Manager</div>
                                <div className="text-[10px] text-slate-500">Employee Ops</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('john@hrshield.com', 'EmployeePassword123!')}
                                className="py-1.5 px-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition hover:border-slate-700"
                            >
                                <div className="font-medium text-[11px] text-slate-300">Employee</div>
                                <div className="text-[10px] text-slate-500">Consent Portal</div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[10px] text-slate-500">
                    Compliance & Privacy Governance
                </div>
            </div>
        </div>
    );
};

export default Login;