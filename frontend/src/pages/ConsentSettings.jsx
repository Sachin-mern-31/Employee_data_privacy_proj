import React, { useState, useEffect } from 'react';
import { getConsentsApi, updateConsentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, ShieldCheck, ShieldAlert, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const ConsentSettings = () => {
    const { user } = useAuth();
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateMessage, setUpdateMessage] = useState('');

    const fetchConsents = async () => {
        setLoading(true);
        try {
            const res = await getConsentsApi();
            setConsents(res.data);
        } catch (error) {
            console.error('Error loading consents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsents();
    }, []);

    const handleToggleConsent = async (purpose, currentGranted) => {
        const newGranted = !currentGranted;
        try {
            await updateConsentApi({
                purpose,
                granted: newGranted
            });

            setUpdateMessage(
                `Consent preferences updated for ${purpose}. Change logged in audit registry.`
            );
            fetchConsents();
        } catch (error) {
            console.error('Failed to update consent:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                Loading your DPDP / GDPR consent preferences...
            </div>
        );
    }

    return (
        <div className="p-5 space-y-4 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-500" /> Data Privacy & Consent
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compliant with DPDP Act & GDPR. You can manage or withdraw data processing consent at any time.
                </p>
            </div>

            {updateMessage && (
                <div className="panel-card p-3 bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        <span>{updateMessage}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">Audit Log Recorded</span>
                </div>
            )}

            {/* Consents Card List */}
            <div className="space-y-3">
                {consents.map((item) => (
                    <div
                        key={item.purpose}
                        className="panel-card p-4 transition"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{item.purposeTitle}</h3>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            item.granted
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                                : 'bg-[#231819] text-[#c77a7f] border-[#3f2427]'
                                        }`}
                                    >
                                        {item.granted ? 'Granted' : 'Revoked'}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>

                                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5 flex items-center gap-3">
                                    <span>Purpose: {item.purpose}</span>
                                    {item.grantedAt && (
                                        <span>Granted: {new Date(item.grantedAt).toLocaleDateString()}</span>
                                    )}
                                    {item.revokedAt && (
                                        <span className="text-slate-400">Revoked: {new Date(item.revokedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Toggle Button */}
                            <div className="shrink-0">
                                <button
                                    onClick={() => handleToggleConsent(item.purpose, item.granted)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                                        item.granted
                                            ? 'btn-secondary text-slate-300 hover:text-white'
                                            : 'btn-primary'
                                    }`}
                                >
                                    {item.granted ? (
                                        <>
                                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Revoke Consent
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Grant Consent
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsentSettings;

