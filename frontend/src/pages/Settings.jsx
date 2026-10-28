import React, { useState, useEffect } from 'react';
import { getSettingsApi, updateSettingsApi } from '../services/api';
import { Settings as SettingsIcon, Building, Shield, Bell, Database, CheckCircle2 } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getSettingsApi();
            setSettings(res.data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback('');
        try {
            await updateSettingsApi(settings);
            setFeedback('System security settings updated successfully.');
            fetchSettings();
        } catch (error) {
            console.error('Save settings failed:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading && !settings) {
        return (
            <div className="p-8 text-center text-slate-500">
                Loading system configuration settings...
            </div>
        );
    }

    return (
        <div className="p-5 space-y-4 max-w-3xl">
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-slate-500" /> System Settings
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Organization profile, password policies, and audit retention thresholds
                </p>
            </div>

            {feedback && (
                <div className="p-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <span>{feedback}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* 1. Organization Information */}
                <div className="panel-card p-4 space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Organization Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Organization Name</label>
                            <input
                                type="text"
                                value={settings?.organizationName || ''}
                                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Security Contact Email</label>
                            <input
                                type="email"
                                value={settings?.orgEmail || ''}
                                onChange={(e) => setSettings({ ...settings, orgEmail: e.target.value })}
                                className="input-field font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Security & Password Policy */}
                <div className="panel-card p-4 space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <Shield className="w-3.5 h-3.5 text-slate-500" /> Authentication & Password Policy
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Min Password Length</label>
                            <input
                                type="number"
                                value={settings?.passwordPolicy?.minLength || 12}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    passwordPolicy: { ...settings.passwordPolicy, minLength: Number(e.target.value) }
                                })}
                                className="input-field font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Max Failed Attempts</label>
                            <input
                                type="number"
                                value={settings?.passwordPolicy?.maxLoginAttempts || 5}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    passwordPolicy: { ...settings.passwordPolicy, maxLoginAttempts: Number(e.target.value) }
                                })}
                                className="input-field font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Lockout Duration (Mins)</label>
                            <input
                                type="number"
                                value={settings?.passwordPolicy?.lockoutDurationMinutes || 15}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    passwordPolicy: { ...settings.passwordPolicy, lockoutDurationMinutes: Number(e.target.value) }
                                })}
                                className="input-field font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Audit Engine Thresholds */}
                <div className="panel-card p-4 space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <Database className="w-3.5 h-3.5 text-slate-500" /> Audit Engine Rules & Thresholds
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Data Retention (Days)</label>
                            <input
                                type="number"
                                value={settings?.auditPolicy?.retentionThresholdDays || 365}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    auditPolicy: { ...settings.auditPolicy, retentionThresholdDays: Number(e.target.value) }
                                })}
                                className="input-field font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Anomaly Velocity (Accesses/Hr)</label>
                            <input
                                type="number"
                                value={settings?.auditPolicy?.anomalyAccessThresholdPerHour || 10}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    auditPolicy: { ...settings.auditPolicy, anomalyAccessThresholdPerHour: Number(e.target.value) }
                                })}
                                className="input-field font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;

