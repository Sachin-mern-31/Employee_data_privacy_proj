import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const RiskBadge = ({ level = 'LOW', showIcon = true }) => {
    const norm = String(level).toUpperCase();

    const config = {
        CRITICAL: {
            label: 'Critical',
            badgeClass: 'badge-critical',
            icon: <ShieldAlert className="w-3 h-3 text-current opacity-75" />
        },
        HIGH: {
            label: 'High',
            badgeClass: 'badge-high',
            icon: <AlertTriangle className="w-3 h-3 text-current opacity-75" />
        },
        MEDIUM: {
            label: 'Medium',
            badgeClass: 'badge-medium',
            icon: <AlertCircle className="w-3 h-3 text-current opacity-75" />
        },
        LOW: {
            label: 'Low',
            badgeClass: 'badge-low',
            icon: <Info className="w-3 h-3 text-current opacity-75" />
        }
    };

    const current = config[norm] || config.LOW;

    return (
        <span className={`badge-status ${current.badgeClass}`}>
            {showIcon && current.icon}
            <span>{current.label}</span>
        </span>
    );
};

export default RiskBadge;
