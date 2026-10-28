import React, { useState, useEffect } from 'react';
import { getAlertsApi, markAlertReadApi } from '../services/api';
import { Bell, AlertTriangle, CheckCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const SecurityAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await getAlertsApi();
            setAlerts(res.data.alerts || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAlertReadApi(id);
            fetchAlerts();
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    return (
        <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-500" /> Security Alerts
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Real-time alerts triggered by sensitive reads, consent events, and policy breaches
                    </p>
                </div>
                <button onClick={fetchAlerts} className="btn-secondary text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {/* Alerts List */}
            <div className="panel-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="uppercase tracking-wider">Alerts ({alerts.length})</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{unreadCount} Unread</span>
                </div>

                <div className="space-y-2.5">
                    {alerts.length > 0 ? (
                        alerts.map((a) => (
                            <div
                                key={a._id}
                                className={`p-3.5 rounded border flex items-start justify-between gap-4 text-xs transition ${
                                    !a.isRead
                                        ? 'bg-slate-50 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700'
                                        : 'bg-white dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/60 opacity-70'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{a.title}</span>
                                        <RiskBadge level={a.severity} />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">{a.description}</p>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                                        Source: {a.source} • {new Date(a.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    {!a.isRead ? (
                                        <button
                                            onClick={() => handleMarkRead(a._id)}
                                            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-3 h-3 text-slate-400" /> Mark Read
                                        </button>
                                    ) : (
                                        <span className="text-[11px] text-slate-400 font-mono">Read</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-8">
                            {loading ? 'Fetching security alerts...' : 'No security alerts registered.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityAlertsPage;

