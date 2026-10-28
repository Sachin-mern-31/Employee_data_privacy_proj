import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Search,
    Bell,
    LogOut,
    Key,
    User,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Users,
    ShieldAlert,
    ExternalLink,
    Sun,
    Moon
} from 'lucide-react';
import { getAlertsApi, markAlertReadApi, getEmployeesApi, getFindingsApi } from '../services/api';

const Navbar = () => {
    const { user, logout, login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showAlertsPopover, setShowAlertsPopover] = useState(false);

    // Global Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ employees: [], findings: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchAlerts();
        }
    }, [user]);

    const fetchAlerts = async () => {
        try {
            const res = await getAlertsApi();
            setAlerts(res.data.alerts || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const handleMarkRead = async (alertId) => {
        try {
            await markAlertReadApi(alertId);
            fetchAlerts();
        } catch (error) {
            console.error('Mark alert read error:', error);
        }
    };

    // Live global search handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch(searchQuery.trim());
            } else {
                setSearchResults({ employees: [], findings: [] });
                setShowSearchDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query) => {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
            const [empRes, findRes] = await Promise.all([
                getEmployeesApi({ search: query }),
                getFindingsApi({ search: query })
            ]);
            setSearchResults({
                employees: empRes.data || [],
                findings: findRes.data || []
            });
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuickSwitch = async (email, password) => {
        try {
            await login(email, password);
        } catch (error) {
            console.error('Quick switch failed:', error);
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-[#111722] border-b border-slate-800 px-5 py-2.5 flex items-center justify-between">
            {/* Left Branding */}
            <div className="flex items-center gap-2.5">
                <div
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer w-8 h-8 rounded-md bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                    <Shield className="w-4 h-4" />
                </div>
                <div>
                    <span
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer font-semibold text-sm text-slate-200 tracking-tight hover:text-white transition"
                    >
                        HRShield
                    </span>
                </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-sm mx-4 hidden md:block" ref={searchRef}>
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employees, findings, logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
                        className="w-full pl-8 pr-3 py-1 bg-slate-900/80 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition"
                    />
                </div>

                {/* Dropdown Search Results */}
                {showSearchDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151c28] border border-slate-800 rounded-md shadow-lg p-3 z-50 max-h-80 overflow-y-auto">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                            <span>SEARCH: "{searchQuery}"</span>
                            <button onClick={() => setShowSearchDropdown(false)} className="hover:text-white">✕</button>
                        </div>

                        {isSearching ? (
                            <div className="p-3 text-center text-xs text-slate-500">Searching...</div>
                        ) : (
                            <div className="space-y-3">
                                {/* Employees section */}
                                <div>
                                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                        <Users className="w-3 h-3 text-slate-500" /> Employees ({searchResults.employees.length})
                                    </div>
                                    {searchResults.employees.length === 0 ? (
                                        <p className="text-[11px] text-slate-500 px-2">No matching employees</p>
                                    ) : (
                                        searchResults.employees.slice(0, 3).map((emp) => (
                                            <div
                                                key={emp._id}
                                                onClick={() => {
                                                    navigate(`/employees/${emp._id}`);
                                                    setShowSearchDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs transition"
                                            >
                                                <div>
                                                    <span className="font-medium text-slate-200">{emp.name}</span>
                                                    <span className="text-[11px] text-slate-500 ml-2">({emp.employeeId})</span>
                                                    <div className="text-[10px] text-slate-500">{emp.designation}</div>
                                                </div>
                                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Findings section */}
                                <div>
                                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3 text-slate-500" /> Findings ({searchResults.findings.length})
                                    </div>
                                    {searchResults.findings.length === 0 ? (
                                        <p className="text-[11px] text-slate-500 px-2">No matching findings</p>
                                    ) : (
                                        searchResults.findings.slice(0, 3).map((fnd) => (
                                            <div
                                                key={fnd._id}
                                                onClick={() => {
                                                    navigate('/findings');
                                                    setShowSearchDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-xs transition"
                                            >
                                                <div className="font-medium text-slate-300 flex items-center justify-between">
                                                    <span className="truncate">{fnd.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono ml-2">{fnd.severity}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Demo Role Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px]">Role:</span>
                <select
                    value={user?.role || 'SUPER_ADMIN'}
                    onChange={(e) => {
                        const roleMap = {
                            'SUPER_ADMIN': ['admin@hrshield.com', 'AdminPassword123!'],
                            'SECURITY_AUDITOR': ['auditor@hrshield.com', 'AuditorPassword123!'],
                            'HR_MANAGER': ['hr@hrshield.com', 'ManagerPassword123!'],
                            'EMPLOYEE': ['john@hrshield.com', 'EmployeePassword123!']
                        };
                        const target = roleMap[e.target.value];
                        if (target) handleQuickSwitch(target[0], target[1]);
                    }}
                    className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 outline-none cursor-pointer"
                >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SECURITY_AUDITOR">Security Auditor</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="EMPLOYEE">Employee</option>
                </select>
            </div>

            {/* Right Notifications & Profile */}
            <div className="flex items-center gap-2">
                {/* Dark / Light Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center gap-1 text-xs"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun className="w-3.5 h-3.5 text-slate-400" />
                            <span className="hidden xl:inline text-[11px] text-slate-400">Light</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden xl:inline text-[11px] text-slate-600">Dark</span>
                        </>
                    )}
                </button>
                {/* Security Alerts Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                        className="relative p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                        title="Security Alerts"
                    >
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-700 text-slate-200 border border-slate-600 text-[9px] font-medium flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Alerts Popover */}
                    {showAlertsPopover && (
                        <div className="absolute right-0 mt-1.5 w-72 bg-[#151c28] border border-slate-800 rounded-md shadow-lg p-3 z-50">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-medium text-slate-300">
                                <span>ALERTS</span>
                                <span className="text-[10px] text-slate-400">{unreadCount} unread</span>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {alerts.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-3 text-center">No active security alerts</p>
                                ) : (
                                    alerts.map((a) => (
                                        <div
                                            key={a._id}
                                            className={`p-2 rounded border text-xs ${
                                                !a.isRead ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-75'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                                                <span className="flex items-center gap-1 truncate">
                                                    <AlertTriangle className={`w-3.5 h-3.5 ${a.severity === 'HIGH' || a.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
                                                    {a.title}
                                                </span>
                                                {!a.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(a._id)}
                                                        className="text-[10px] text-blue-400 hover:underline"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-tight">{a.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                {user && (
                    <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                                {user.role === 'SUPER_ADMIN' && 'SUPER ADMIN'}
                                {user.role === 'SECURITY_AUDITOR' && 'SECURITY AUDITOR'}
                                {user.role === 'HR_MANAGER' && 'HR MANAGER'}
                                {user.role === 'HR_STAFF' && 'HR STAFF'}
                                {user.role === 'EMPLOYEE' && 'EMPLOYEE'}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            title="Log Out"
                            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
