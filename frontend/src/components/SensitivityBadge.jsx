import React from 'react';
import { Globe, Building, ShieldAlert, Lock } from 'lucide-react';

const SensitivityBadge = ({ level = 'Public', size = 'sm' }) => {
    const normalize = level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : 'Public';

    const config = {
        Public: {
            label: 'Public',
            badgeClass: 'badge-public',
            icon: <Globe className="w-3.5 h-3.5" />
        },
        Internal: {
            label: 'Internal',
            badgeClass: 'badge-internal',
            icon: <Building className="w-3.5 h-3.5" />
        },
        Confidential: {
            label: 'Confidential',
            badgeClass: 'badge-confidential',
            icon: <ShieldAlert className="w-3.5 h-3.5" />
        },
        Restricted: {
            label: 'Restricted',
            badgeClass: 'badge-restricted',
            icon: <Lock className="w-3.5 h-3.5" />
        }
    };

    const current = config[normalize] || config.Public;

    return (
        <span className={`badge-sensitivity ${current.badgeClass}`}>
            {current.icon}
            <span>{current.label}</span>
        </span>
    );
};

export default SensitivityBadge;
