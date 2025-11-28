'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@cp/firebase';
import { useDashboard } from '../contexts/DashboardContext';

export function HeaderActions() {
    const router = useRouter();
    const { setShowReportWizard } = useDashboard();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                className="btn-outline text-sm"
                onClick={() => setShowReportWizard(true)}
            >
                Export
            </button>
            <button onClick={handleSignOut} className="btn-secondary text-sm">
                Sign Out
            </button>
        </div>
    );
}
