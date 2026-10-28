import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Shield,
    Eye,
    ShieldAlert,
    AlertOctagon,
    SlidersHorizontal,
    FileText,
    FileCheck2,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Lock
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isAuditor = user?.role === 'SECURITY_AUDITOR';
    const isHRManager = user?.role === 'HR_MANAGER';
    const isHRStaff = user?.role === 'HR_STAFF';
    const isEmployee = user?.role === 'EMPLOYEE';

    const canAccessGovernance = isSuperAdmin || isAuditor || isHRManager || isHRStaff;

    const navSections = [
        {
            title: '1. Core Overview',
            items: [
                ...(canAccessGovernance
                    ? [
                          {
                              name: 'Dashboard & Guide',
                              path: '/dashboard',
                              icon: <LayoutDashboard className="w-4 h-4" />,
                              hint: 'System Overview'
                          }
                      ]
                    : []),
                {
                    name: isEmployee ? 'My Profile' : 'Employees & PII',
                    path: isEmployee ? '/profile' : '/employees',
                    icon: <Users className="w-4 h-4" />,
                    hint: 'AES-256 Masked Data'
                }
            ]
        },
        ...(canAccessGovernance
            ? [
                  {
                      title: '2. Audits & Risks',
                      items: [
                          {
                              name: 'Privacy Audit',
                              path: '/privacy-audit',
                              icon: <Eye className="w-4 h-4" />,
                              hint: 'DPDP Compliance'
                          },
                          {
                              name: 'Security Audit',
                              path: '/security-audit',
                              icon: <Shield className="w-4 h-4" />,
                              hint: 'Threat Scans'
                          },
                          {
                              name: 'Audit Findings',
                              path: '/findings',
                              icon: <ShieldAlert className="w-4 h-4" />,
                              hint: 'Vulnerability Tracker'
                          },
                          {
                              name: 'Risk Matrix',
                              path: '/risks',
                              icon: <AlertOctagon className="w-4 h-4" />,
                              hint: 'Likelihood × Impact'
                          }
                      ]
                  },
                  {
                      title: '3. Telemetry & Governance',
                      items: [
                          {
                              name: 'Activity Logs',
                              path: '/audit-logs',
                              icon: <FileText className="w-4 h-4" />,
                              hint: 'Immutable Audit Trail'
                          },
                          {
                              name: 'Compliance Reports',
                              path: '/reports',
                              icon: <FileCheck2 className="w-4 h-4" />,
                              hint: 'Executive Summary'
                          },
                          {
                              name: 'Access Control',
                              path: '/access-control',
                              icon: <Lock className="w-4 h-4" />,
                              hint: 'RBAC Matrix'
                          },
                          ...(isSuperAdmin || isAuditor
                              ? [
                                    {
                                        name: 'Users & Roles',
                                        path: '/users',
                                        icon: <UserCheck className="w-4 h-4" />,
                                        hint: 'Account Roles'
                                    }
                                ]
                              : []),
                          {
                              name: 'Security Alerts',
                              path: '/alerts',
                              icon: <Bell className="w-4 h-4" />,
                              hint: 'Live Notifications'
                          },
                          {
                              name: 'Settings',
                              path: '/settings',
                              icon: <Settings className="w-4 h-4" />,
                              hint: 'Security Policies'
                          }
                      ]
                  }
              ]
            : [
                  {
                      title: 'My Governance',
                      items: [
                          {
                              name: 'DPDP Consent Settings',
                              path: '/consents',
                              icon: <FileCheck2 className="w-4 h-4" />,
                              hint: 'Privacy Consents'
                          }
                      ]
                  }
              ])
    ];

    return (
        <aside
            className={`transition-all duration-200 bg-[#111722] border-r border-slate-800 min-h-[calc(100vh-57px)] flex flex-col justify-between shrink-0 ${
                collapsed ? 'w-16 p-2' : 'w-60 p-3'
            }`}
        >
            <div className="space-y-4">
                {/* Collapse Toggle */}
                <div className="flex items-center justify-between px-1 pt-1">
                    {!collapsed && (
                        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            HRShield Navigation
                        </h3>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition mx-auto cursor-pointer"
                        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-3.5">
                    {navSections.map((sec, idx) => (
                        <div key={idx} className="space-y-0.5">
                            {!collapsed && (
                                <div className="px-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                                    {sec.title}
                                </div>
                            )}
                            {sec.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    title={item.hint ? `${item.name} (${item.hint})` : item.name}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition ${
                                            isActive
                                                ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700/60'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                        } ${collapsed ? 'justify-center px-0' : ''}`
                                    }
                                >
                                    <span className="shrink-0 text-current">{item.icon}</span>
                                    {!collapsed && (
                                        <div className="flex items-center justify-between flex-1 truncate">
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Governance Status Badge */}
            {!collapsed && (
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>AES-256 Audit</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Active</span>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
